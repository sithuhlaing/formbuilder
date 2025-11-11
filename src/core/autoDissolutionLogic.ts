/**
 * PHASE 3: Auto-Dissolution Logic Implementation
 * Handles automatic dissolution of row containers when they have ≤1 child
 */

import type { Component } from '../types/components';
import { LayoutEngine, type DissolutionContext } from './layoutEngine';

export interface DissolutionResult {
  dissolved: boolean;
  updatedComponents: Component[];
  dissolvedRow?: Component;
  promotedComponents?: Component[];
  trigger: 'delete' | 'move_out' | 'manual';
  message: string;
}

export interface DissolutionCandidate {
  rowLayout: Component;
  parentComponents: Component[];
  rowIndex: number;
  childCount: number;
  shouldDissolve: boolean;
}

/**
 * Auto-Dissolution System Class
 */
export class AutoDissolutionLogic {
  
  /**
   * Check for and perform auto-dissolution on all row layouts
   */
  static checkAndDissolveAll(components: Component[]): DissolutionResult {
    let updatedComponents = [...components];
    let dissolved = false;
    let dissolvedRows: Component[] = [];
    let promotedComponents: Component[] = [];
    
    // Check each component for dissolution candidates
    for (let i = 0; i < updatedComponents.length; i++) {
      const component = updatedComponents[i];
      
      if (component.type === 'horizontal_layout') {
        const candidate = this.analyzeDissolutionCandidate(component, updatedComponents, i);
        
        if (candidate.shouldDissolve) {
          const result = this.dissolveRowLayout(candidate);
          updatedComponents = result.updatedComponents;
          dissolved = true;
          dissolvedRows.push(candidate.rowLayout);
          
          if (result.promotedComponents) {
            promotedComponents.push(...result.promotedComponents);
          }
          
          // Adjust index since array was modified
          i--;
        }
      }
    }
    
    return {
      dissolved,
      updatedComponents,
      dissolvedRow: dissolvedRows[0], // Primary dissolved row
      promotedComponents,
      trigger: 'manual',
      message: dissolved 
        ? `Dissolved ${dissolvedRows.length} row layout(s)` 
        : 'No rows dissolved'
    };
  }
  
  /**
   * Check a specific row layout for dissolution
   */
  static checkRowForDissolution(
    rowLayout: Component,
    parentComponents: Component[]
  ): DissolutionResult {
    const rowIndex = parentComponents.findIndex(c => c.id === rowLayout.id);
    
    if (rowIndex === -1) {
      return {
        dissolved: false,
        updatedComponents: parentComponents,
        trigger: 'delete',
        message: 'Row layout not found in parent'
      };
    }
    
    const candidate = this.analyzeDissolutionCandidate(rowLayout, parentComponents, rowIndex);
    
    if (!candidate.shouldDissolve) {
      return {
        dissolved: false,
        updatedComponents: parentComponents,
        trigger: 'delete',
        message: 'Row layout does not meet dissolution criteria'
      };
    }
    
    return this.dissolveRowLayout(candidate);
  }
  
  /**
   * Analyze if a row layout is a dissolution candidate
   */
  private static analyzeDissolutionCandidate(
    rowLayout: Component,
    parentComponents: Component[],
    rowIndex: number
  ): DissolutionCandidate {
    const childCount = rowLayout.children?.length || 0;
    const shouldDissolve = childCount <= 1;
    
    return {
      rowLayout,
      parentComponents,
      rowIndex,
      childCount,
      shouldDissolve
    };
  }
  
  /**
   * Perform the actual dissolution of a row layout
   */
  private static dissolveRowLayout(candidate: DissolutionCandidate): DissolutionResult {
    const { rowLayout, parentComponents, rowIndex, childCount } = candidate;
    
    // Create updated components array
    const updatedComponents = [...parentComponents];
    
    // Remove the row layout
    updatedComponents.splice(rowIndex, 1);
    
    // Extract remaining children
    const remainingChildren = [...(rowLayout.children || [])];
    
    // Insert remaining children at the same position
    if (remainingChildren.length > 0) {
      updatedComponents.splice(rowIndex, 0, ...remainingChildren);
    }
    
    // Generate appropriate message
    let message: string;
    if (childCount === 0) {
      message = `Row container dissolved: Empty row removed`;
    } else {
      message = `Row container dissolved: ${remainingChildren.length} component(s) promoted to column level`;
    }
    
    return {
      dissolved: true,
      updatedComponents,
      dissolvedRow: rowLayout,
      promotedComponents: remainingChildren,
      trigger: 'delete',
      message
    };
  }
  
  /**
   * Handle dissolution after component deletion
   */
  static handleDeletionDissolution(
    deletedComponent: Component,
    components: Component[]
  ): DissolutionResult {
    // Find if the deleted component was in a row
    const rowParent = this.findRowParent(deletedComponent, components);
    
    if (!rowParent) {
      return {
        dissolved: false,
        updatedComponents: components,
        trigger: 'delete',
        message: 'Deleted component was not in a row'
      };
    }
    
    // Check if the row now needs dissolution
    return this.checkRowForDissolution(rowParent.rowLayout, rowParent.parentComponents);
  }
  
  /**
   * Handle dissolution after component move out of row
   */
  static handleMoveOutDissolution(
    movedComponent: Component,
    originalParentComponents: Component[]
  ): DissolutionResult {
    // Find if the moved component was in a row
    const rowParent = this.findRowParent(movedComponent, originalParentComponents);
    
    if (!rowParent) {
      return {
        dissolved: false,
        updatedComponents: originalParentComponents,
        trigger: 'move_out',
        message: 'Moved component was not in a row'
      };
    }
    
    // Check if the row now needs dissolution
    return this.checkRowForDissolution(rowParent.rowLayout, rowParent.parentComponents);
  }
  
  /**
   * Find the row parent of a component
   */
  private static findRowParent(
    component: Component,
    components: Component[]
  ): { rowLayout: Component; parentComponents: Component[] } | null {
    for (let i = 0; i < components.length; i++) {
      const parent = components[i];
      
      if (parent.type === 'horizontal_layout') {
        // Check if component is a direct child
        const childIndex = parent.children?.findIndex(c => c.id === component.id) ?? -1;
        
        if (childIndex !== -1) {
          return {
            rowLayout: parent,
            parentComponents: components
          };
        }
        
        // Check nested rows (though this shouldn't happen with validation)
        const nestedResult = this.findRowParent(component, parent.children || []);
        if (nestedResult) {
          return nestedResult;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Predict dissolution before it happens
   */
  static predictDissolution(
    components: Component[],
    operation: 'delete' | 'move' | 'add',
    targetComponent?: Component
  ): DissolutionCandidate[] {
    const candidates: DissolutionCandidate[] = [];
    
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      
      if (component.type === 'horizontal_layout') {
        let childCount = component.children?.length || 0;
        
        // Adjust child count based on predicted operation
        switch (operation) {
          case 'delete':
            if (targetComponent && this.isChildOfRow(targetComponent, component)) {
              childCount--;
            }
            break;
            
          case 'move':
            if (targetComponent && this.isChildOfRow(targetComponent, component)) {
              childCount--;
            }
            break;
            
          case 'add':
            // Adding to row doesn't affect dissolution prediction
            break;
        }
        
        const candidate: DissolutionCandidate = {
          rowLayout: component,
          parentComponents: components,
          rowIndex: i,
          childCount,
          shouldDissolve: childCount <= 1
        };
        
        if (candidate.shouldDissolve) {
          candidates.push(candidate);
        }
      }
    }
    
    return candidates;
  }
  
  /**
   * Check if component is a child of a specific row
   */
  private static isChildOfRow(component: Component, rowLayout: Component): boolean {
    if (!rowLayout.children) return false;
    
    return rowLayout.children.some(child => child.id === component.id);
  }
  
  /**
   * Get dissolution statistics
   */
  static getDissolutionStats(components: Component[]): {
    totalRows: number;
    dissolutionCandidates: number;
    atRiskRows: number;
  } {
    let totalRows = 0;
    let dissolutionCandidates = 0;
    let atRiskRows = 0;
    
    for (const component of components) {
      if (component.type === 'horizontal_layout') {
        totalRows++;
        const childCount = component.children?.length || 0;
        
        if (childCount <= 1) {
          dissolutionCandidates++;
        }
        
        if (childCount === 2) {
          atRiskRows++; // Rows with 2 children are at risk of dissolution
        }
      }
    }
    
    return {
      totalRows,
      dissolutionCandidates,
      atRiskRows
    };
  }
  
  /**
   * Validate dissolution constraints
   */
  static validateDissolution(
    rowLayout: Component,
    parentComponents: Component[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // Check if row exists
    const rowIndex = parentComponents.findIndex(c => c.id === rowLayout.id);
    if (rowIndex === -1) {
      errors.push({
        code: 'ROW_NOT_FOUND',
        message: 'Row layout not found in parent components.',
        severity: 'error'
      });
    }
    
    // Check child count
    const childCount = rowLayout.children?.length || 0;
    if (childCount > 1) {
      errors.push({
        code: 'ROW_HAS_TOO_MANY_CHILDREN',
        message: `Row has ${childCount} children. Dissolution requires ≤1 child.`,
        severity: 'error'
      });
    }
    
    // Check for nested rows (shouldn't happen with validation)
    for (const child of rowLayout.children || []) {
      if (child.type === 'horizontal_layout') {
        errors.push({
          code: 'NESTED_ROW_DETECTED',
          message: 'Cannot dissolve row containing nested rows.',
          severity: 'error'
        });
        break;
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Create dissolution animation data
   */
  static createDissolutionAnimation(
    rowLayout: Component,
    parentComponents: Component[]
  ): {
    from: Component[];
    to: Component[];
    duration: number;
    steps: AnimationStep[];
  } {
    const rowIndex = parentComponents.findIndex(c => c.id === rowLayout.id);
    const remainingChildren = rowLayout.children || [];
    
    const from = [...parentComponents];
    const to = [...parentComponents];
    to.splice(rowIndex, 1, ...remainingChildren);
    
    const steps: AnimationStep[] = [
      {
        type: 'highlight',
        target: rowLayout.id,
        duration: 300,
        message: 'Row will dissolve'
      },
      {
        type: 'extract',
        target: rowLayout.id,
        children: remainingChildren.map(c => c.id),
        duration: 500,
        message: 'Extracting components'
      },
      {
        type: 'promote',
        targets: remainingChildren.map(c => c.id),
        duration: 300,
        message: 'Promoting to column level'
      },
      {
        type: 'cleanup',
        target: rowLayout.id,
        duration: 200,
        message: 'Removing empty row'
      }
    ];
    
    return {
      from,
      to,
      duration: 1300,
      steps
    };
  }
}

// Animation step interface
interface AnimationStep {
  type: 'highlight' | 'extract' | 'promote' | 'cleanup';
  target?: string;
  children?: string[];
  targets?: string[];
  duration: number;
  message: string;
}

// ValidationResult interface (reused from validation system)
interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export default AutoDissolutionLogic;
