/**
 * PHASE 3: Core Layout Engine Implementation
 * Implements the complete drag-drop layout system according to PRD requirements
 */

import type { Component, ComponentType } from '../types/components';

// Core Enums
export enum DropPosition {
  BEFORE = 'before',
  AFTER = 'after',
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center',
  INSIDE = 'inside'
}

export enum DragType {
  NEW_ITEM = 'new-item',
  EXISTING_ITEM = 'existing-item'
}

// Core Interfaces
export interface DragData {
  dragType: DragType;
  sourceId?: string;
  componentType: ComponentType;
  item: Component | null;
  isRowLayout?: boolean;
}

export interface DropZoneConfig {
  horizontalEdge: number;
  verticalEdge: number;
  centerBlocked: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  componentId?: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  code: string;
  message: string;
  componentId?: string;
}

export interface ComponentContext {
  targetIndex: number;
  isInRow: boolean;
  rowLayout?: Component;
  parentComponents: Component[];
}

export interface DissolutionContext {
  rowLayout: Component;
  parentComponents: Component[];
  trigger: 'delete' | 'move_out' | 'manual';
}

export interface HorizontalLayoutCreationContext {
  dragData: DragData;
  targetComponent: Component;
  dropPosition: DropPosition.LEFT | DropPosition.RIGHT;
  parentComponents: Component[];
}

// Constants
const DEFAULT_CONFIG: DropZoneConfig = {
  horizontalEdge: 0.2,
  verticalEdge: 0.3,
  centerBlocked: true
};

const LAYOUT_CONSTRAINTS = {
  row: {
    minComponents: 2,
    maxComponents: 12,
    allowedDropZones: ['left', 'right'],
    noNesting: true
  },
  column: {
    allowedDropZones: ['before', 'after'],
    unlimitedComponents: true
  }
};

/**
 * Core Layout Engine Class
 */
export class LayoutEngine {
  
  /**
   * Calculate drop position based on mouse coordinates
   */
  static calculateDropPosition(
    mouseX: number,
    mouseY: number,
    targetElement: HTMLElement,
    targetComponent: Component,
    config: DropZoneConfig = DEFAULT_CONFIG
  ): DropPosition | null {
    
    const rect = targetElement.getBoundingClientRect();
    
    // Calculate percentages
    const xPercent = (mouseX - rect.left) / rect.width;
    const yPercent = (mouseY - rect.top) / rect.height;
    
    // Validate percentages are in bounds
    if (xPercent < 0 || xPercent > 1 || yPercent < 0 || yPercent > 1) {
      return null;
    }
    
    // Priority 1: Check horizontal zones (left/right)
    if (xPercent < config.horizontalEdge) {
      return DropPosition.LEFT;
    }
    if (xPercent > (1 - config.horizontalEdge)) {
      return DropPosition.RIGHT;
    }
    
    // Priority 2: Check vertical zones (top/bottom)
    if (yPercent < config.verticalEdge) {
      return DropPosition.BEFORE;
    }
    if (yPercent > (1 - config.verticalEdge)) {
      return DropPosition.AFTER;
    }
    
    // Priority 3: Center area
    if (targetComponent.type === 'horizontal_layout') {
      return config.centerBlocked ? null : DropPosition.CENTER;
    }
    
    // Center of regular component = insert after (default behavior)
    return DropPosition.AFTER;
  }
  
  /**
   * Create drag data for drag start
   */
  static createDragData(source: 'palette' | 'canvas', component: any): DragData {
    if (source === 'palette') {
      return {
        dragType: DragType.NEW_ITEM,
        componentType: component.type,
        item: null
      };
    } else {
      return {
        dragType: DragType.EXISTING_ITEM,
        sourceId: component.id,
        componentType: component.type,
        item: component,
        isRowLayout: component.type === 'horizontal_layout'
      };
    }
  }
  
  /**
   * Find component with context (whether it's in a row)
   */
  static findComponentWithContext(
    target: Component,
    components: Component[]
  ): ComponentContext {
    
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      
      // Direct match
      if (component.id === target.id) {
        return {
          targetIndex: i,
          isInRow: false,
          parentComponents: components
        };
      }
      
      // Search within horizontal layouts
      if (component.type === 'horizontal_layout') {
        const rowLayout = component;
        const childIndex = rowLayout.children?.findIndex(c => c.id === target.id) ?? -1;
        
        if (childIndex !== -1) {
          return {
            targetIndex: i,
            isInRow: true,
            rowLayout: rowLayout,
            parentComponents: components
          };
        }
      }
    }
    
    return {
      targetIndex: -1,
      isInRow: false,
      parentComponents: components
    };
  }
  
  /**
   * Create horizontal layout
   */
  static createHorizontalLayout(context: HorizontalLayoutCreationContext): Component[] {
    const { dragData, targetComponent, dropPosition, parentComponents } = context;
    
    // Step 1: Get or create the dragged component
    let draggedComponent: Component;
    
    if (dragData.dragType === DragType.NEW_ITEM) {
      draggedComponent = this.createComponent(dragData.componentType);
    } else {
      draggedComponent = dragData.item!;
    }
    
    // Step 2: Check if target is already in a horizontal layout
    const targetContext = this.findComponentWithContext(targetComponent, parentComponents);
    
    if (targetContext.isInRow) {
      // Target is already in a row - try to add to existing row
      return this.addToExistingRow(targetContext.rowLayout!, draggedComponent, targetComponent, dropPosition);
    }
    
    // Step 3: Create new horizontal layout container
    const newRowLayout: Component = {
      id: this.generateId('row'),
      type: 'horizontal_layout',
      label: 'Row Layout',
      required: false,
      validation: {},
      properties: {},
      children: []
    };
    
    // Step 4: Arrange children based on drop position
    if (dropPosition === DropPosition.LEFT) {
      newRowLayout.children = [draggedComponent, targetComponent];
    } else {
      newRowLayout.children = [targetComponent, draggedComponent];
    }
    
    // Step 5: Replace target component with new row layout
    const targetIndex = parentComponents.indexOf(targetComponent);
    const updatedComponents = [...parentComponents];
    updatedComponents.splice(targetIndex, 1, newRowLayout);
    
    // Step 6: If dragged component was existing, remove from old position
    if (dragData.dragType === DragType.EXISTING_ITEM) {
      const oldIndex = updatedComponents.findIndex(c => c.id === draggedComponent.id);
      if (oldIndex !== -1 && oldIndex !== targetIndex) {
        updatedComponents.splice(oldIndex, 1);
      }
    }
    
    return updatedComponents;
  }
  
  /**
   * Add component to existing row
   */
  static addToExistingRow(
    rowLayout: Component,
    newComponent: Component,
    targetComponent: Component,
    dropPosition: DropPosition.LEFT | DropPosition.RIGHT
  ): Component[] {
    
    // Step 1: Validate capacity
    if ((rowLayout.children?.length ?? 0) >= 12) {
      throw new Error('Cannot add component: This row already contains the maximum of 12 components.');
    }
    
    // Step 2: Find target position within row
    const targetIndex = rowLayout.children?.findIndex(c => c.id === targetComponent.id) ?? -1;
    
    if (targetIndex === -1) {
      throw new Error('Target component not found in row');
    }
    
    // Step 3: Insert new component
    const insertIndex = dropPosition === DropPosition.LEFT ? targetIndex : targetIndex + 1;
    const updatedChildren = [...(rowLayout.children ?? [])];
    updatedChildren.splice(insertIndex, 0, newComponent);
    
    // Step 4: Update row layout
    rowLayout.children = updatedChildren;
    
    return [rowLayout];
  }
  
  /**
   * Insert component in column layout
   */
  static insertInColumnLayout(
    components: Component[],
    newComponent: Component,
    targetComponent: Component,
    position: DropPosition.BEFORE | DropPosition.AFTER
  ): Component[] {
    
    // Step 1: Find target index (may be nested in row layout)
    const { targetIndex, isInRow, rowLayout } = this.findComponentWithContext(targetComponent, components);
    
    if (targetIndex === -1) {
      throw new Error('Target component not found');
    }
    
    // Step 2: Determine insert index
    let insertIndex: number;
    
    if (isInRow) {
      // Target is in a row - insert relative to the ROW, not the component
      const rowIndex = components.findIndex(c => c.id === rowLayout?.id);
      insertIndex = position === DropPosition.BEFORE ? rowIndex : rowIndex + 1;
    } else {
      // Target is standalone - insert directly
      insertIndex = position === DropPosition.BEFORE ? targetIndex : targetIndex + 1;
    }
    
    // Step 3: Insert component
    const updatedComponents = [...components];
    updatedComponents.splice(insertIndex, 0, newComponent);
    
    return updatedComponents;
  }
  
  /**
   * Check and dissolve row container
   */
  static checkAndDissolveRowContainer(context: DissolutionContext): Component[] {
    const { rowLayout, parentComponents, trigger } = context;
    
    // Step 1: Check if dissolution is needed
    const childCount = rowLayout.children?.length ?? 0;
    if (childCount > 1) {
      return parentComponents;
    }
    
    // Step 2: Extract remaining children (0 or 1)
    const remainingChildren = [...(rowLayout.children ?? [])];
    
    // Step 3: Find row's position in parent
    const rowIndex = parentComponents.findIndex(c => c.id === rowLayout.id);
    
    if (rowIndex === -1) {
      throw new Error('Row layout not found in parent');
    }
    
    // Step 4: Create updated components array
    const updatedComponents = [...parentComponents];
    
    // Remove row layout
    updatedComponents.splice(rowIndex, 1);
    
    // Insert remaining children at same position
    if (remainingChildren.length > 0) {
      updatedComponents.splice(rowIndex, 0, ...remainingChildren);
    }
    
    // Step 5: Log dissolution
    console.log(`Row container dissolved (${trigger}):`, {
      rowId: rowLayout.id,
      formerChildren: remainingChildren,
      rowIndex
    });
    
    return updatedComponents;
  }
  
  /**
   * Validate layout operation
   */
  static validateLayoutOperation(
    operation: string,
    context: any
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    switch (operation) {
      case 'create_row':
        this.validateRowCreation(context, errors, warnings);
        break;
      case 'add_to_row':
        this.validateAddToRow(context, errors, warnings);
        break;
      case 'move_component':
        this.validateComponentMove(context, errors, warnings);
        break;
      case 'move_row':
        this.validateRowMove(context, errors, warnings);
        break;
      case 'delete_component':
        this.validateComponentDelete(context, errors, warnings);
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate row creation
   */
  private static validateRowCreation(
    context: HorizontalLayoutCreationContext,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Row must have at least 2 components at creation
    const componentCount = 2; // Target + new component
    
    if (componentCount < 2) {
      errors.push({
        code: 'ROW_MIN_SIZE',
        message: 'Row layout must contain at least 2 components.',
        severity: 'error'
      });
    }
  }
  
  /**
   * Validate adding to row
   */
  private static validateAddToRow(
    context: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const { rowLayout } = context;
    const currentCount = rowLayout.children?.length ?? 0;
    
    if (currentCount >= 12) {
      errors.push({
        code: 'ROW_CAPACITY_EXCEEDED',
        message: 'Row layout cannot contain more than 12 components.',
        componentId: rowLayout.id,
        severity: 'error'
      });
    }
  }
  
  /**
   * Validate component move
   */
  private static validateComponentMove(
    context: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Implementation for component move validation
  }
  
  /**
   * Validate row move
   */
  private static validateRowMove(
    context: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const { dropPosition } = context;
    
    if (dropPosition === DropPosition.LEFT || dropPosition === DropPosition.RIGHT) {
      errors.push({
        code: 'ROW_HORIZONTAL_POSITIONING',
        message: 'Row layouts can only be repositioned vertically. Use top or bottom drop zones.',
        severity: 'error'
      });
    }
  }
  
  /**
   * Validate component delete
   */
  private static validateComponentDelete(
    context: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Implementation for component delete validation
  }
  
  /**
   * Create a new component
   */
  static createComponent(componentType: ComponentType): Component {
    const id = this.generateId(componentType);
    
    const baseComponent = {
      id,
      type: componentType,
      label: this.getDefaultLabel(componentType),
      required: false,
      validation: {},
      properties: {}
    };
    
    // Add type-specific properties
    if (componentType === 'horizontal_layout') {
      return {
        ...baseComponent,
        children: []
      };
    }
    
    return baseComponent;
  }
  
  /**
   * Generate unique ID
   */
  static generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get default label for component type
   */
  private static getDefaultLabel(componentType: ComponentType): string {
    const labels: Record<ComponentType, string> = {
      text_input: 'Text Input',
      email_input: 'Email Input',
      number_input: 'Number Input',
      textarea: 'Text Area',
      select: 'Select Dropdown',
      radio_group: 'Radio Group',
      checkbox: 'Checkbox',
      date_picker: 'Date Picker',
      file_upload: 'File Upload',
      heading: 'Heading',
      paragraph: 'Paragraph',
      button: 'Button',
      horizontal_layout: 'Row Layout',
      vertical_layout: 'Vertical Layout',
      section_divider: 'Section Divider',
      divider: 'Divider'
    };
    
    return labels[componentType] || 'Component';
  }
  
  /**
   * Handle full drag-drop flow
   */
  static async handleFullDragDropFlow(
    dragData: DragData,
    targetComponent: Component,
    dropPosition: DropPosition,
    currentComponents: Component[]
  ): Promise<Component[]> {
    
    // Step 1: Validate drop
    const validation = this.validateLayoutOperation('create_row', {
      dragData,
      targetComponent,
      dropPosition,
      parentComponents: currentComponents
    });
    
    if (!validation.valid) {
      throw new Error(validation.errors.map(e => e.message).join(', '));
    }
    
    // Step 2: Create new component (if from palette)
    let componentToAdd: Component;
    
    if (dragData.dragType === DragType.NEW_ITEM) {
      componentToAdd = this.createComponent(dragData.componentType);
    } else {
      componentToAdd = dragData.item!;
    }
    
    // Step 3: Execute layout operation
    let updatedComponents: Component[];
    
    if (dropPosition === DropPosition.LEFT || dropPosition === DropPosition.RIGHT) {
      // Create or add to horizontal layout
      updatedComponents = this.createHorizontalLayout({
        dragData,
        targetComponent,
        dropPosition,
        parentComponents: currentComponents
      });
    } else {
      // Insert in column layout
      updatedComponents = this.insertInColumnLayout(
        currentComponents,
        componentToAdd,
        targetComponent,
        dropPosition as DropPosition.BEFORE | DropPosition.AFTER
      );
    }
    
    // Step 4: If moving existing component, check for dissolution at old position
    if (dragData.dragType === DragType.EXISTING_ITEM) {
      const oldContext = this.findComponentWithContext(componentToAdd, currentComponents);
      
      if (oldContext.isInRow) {
        updatedComponents = this.checkAndDissolveRowContainer({
          rowLayout: oldContext.rowLayout!,
          parentComponents: updatedComponents,
          trigger: 'move_out'
        });
      }
    }
    
    return updatedComponents;
  }
}

export function calculateDropPosition(
  boundingBox: { width: number; height: number; left?: number; top?: number },
  cursor: { x: number; y: number },
  isTopLevel: boolean,
  targetIndex: number
) {
  if (!isTopLevel) {
    // RULE B: We are inside a row. If the cursor is at the outer right edge, we treat it as dropping outside (vertical).
    if (cursor.x >= boundingBox.width * 0.75) {
      return {
        type: 'BETWEEN',
        index: targetIndex + 1
      };
    }
    // Otherwise, calculate left/right reordering based on a 50% midpoint.
    const isLeftHalf = cursor.x < (boundingBox.width / 2);
    return {
      type: 'COLUMN_BETWEEN',
      direction: isLeftHalf ? 'left' : 'right',
      targetColumnIndex: targetIndex
    };
  } else {
    // RULE A: We are on the main canvas. Check the 30% thresholds for row creation.
    if (cursor.x < boundingBox.width * 0.30) {
      return { type: 'SIDE', position: 'left' };
    }
    if (cursor.x > boundingBox.width * 0.70) {
      return { type: 'SIDE', position: 'right' };
    }
    
    // Vertical midpoint splicing
    const isBottomHalf = cursor.y > (boundingBox.height / 2);
    return {
      type: 'BETWEEN',
      index: isBottomHalf ? targetIndex + 1 : targetIndex
    };
  }
}

export function executeLayoutCleanup(components: any[]): any[] {
  return components.flatMap(component => {
    if (component.type === 'horizontal_layout' || component.isLayout) {
      const updatedColumns = (component.columns || []).map((col: any) => ({
        ...col,
        fields: executeLayoutCleanup(col.fields || [])
      }));
      
      const allFields = updatedColumns.flatMap((col: any) => col.fields || []);
      
      if (allFields.length <= 1) {
        return allFields;
      }
      
      return [{
        ...component,
        columns: updatedColumns
      }];
    }
    
    return [component];
  });
}

export function executeLayoutMutation(
  state: any,
  draggedComponent: any,
  command: any
): any {
  if (Array.isArray(state)) {
    const activeCanvas = state as any[];
    
    if (command.type === 'INVALID_DROP_ZONE') {
      return activeCanvas;
    }
    
    if (command.type === 'BETWEEN') {
      const targetIndex = command.index;
      const currentIndex = activeCanvas.findIndex(c => c.id === draggedComponent.id);
      
      if (currentIndex === -1) {
        const result = [...activeCanvas];
        result.splice(targetIndex, 0, draggedComponent);
        return result;
      }
      
      const result = [...activeCanvas];
      const [removed] = result.splice(currentIndex, 1);
      
      let insertIndex = targetIndex;
      if (currentIndex < targetIndex) {
        insertIndex = targetIndex - 1;
      }
      
      result.splice(insertIndex, 0, removed);
      return result;
    }
    
    return activeCanvas;
  } else {
    const activeRow = state;
    
    if (command.type === 'COLUMN_BETWEEN') {
      const targetColumnIndex = command.targetColumnIndex;
      
      const currentIndex = activeRow.columns.findIndex((col: any) => 
        col.fields?.some((f: any) => f.id === draggedComponent.id)
      );
      
      if (currentIndex === -1) {
        return activeRow;
      }
      
      const newColumns = activeRow.columns.map((col: any) => ({
        ...col,
        fields: [...(col.fields || [])]
      }));
      
      const draggedField = newColumns[currentIndex].fields.find((f: any) => f.id === draggedComponent.id);
      
      newColumns[currentIndex].fields = newColumns[currentIndex].fields.filter((f: any) => f.id !== draggedComponent.id);
      
      const temp = newColumns[targetColumnIndex].fields;
      newColumns[targetColumnIndex].fields = [draggedField];
      newColumns[currentIndex].fields = temp;
      
      return {
        ...activeRow,
        columns: newColumns
      };
    }
    
    return activeRow;
  }
}

export default LayoutEngine;

