/**
 * DragDropLogic - Consolidated Drag and Drop Logic Layer
 * Combines all drag-drop operations into a single logic module
 */

import type { FormComponentData, ComponentType } from '../types/component';

export interface DropPosition {
  type: 'before' | 'after' | 'inside' | 'left' | 'right' | 'center';
  targetId: string;
  componentType: ComponentType;
  dragType?: 'new-item' | 'existing-item';
  sourceId?: string;
}

export interface DragDropConfig {
  enableHorizontalLayouts: boolean;
  enableVerticalReordering: boolean;
  enableCrossLayoutMovement: boolean;
  autoDissolveEmptyLayouts: boolean;
}

export class DragDropLogic {
  private config: DragDropConfig;

  constructor(config: Partial<DragDropConfig> = {}) {
    this.config = {
      enableHorizontalLayouts: true,
      enableVerticalReordering: true,
      enableCrossLayoutMovement: true,
      autoDissolveEmptyLayouts: true,
      ...config
    };
  }

  /**
   * Main drop handler - processes all drop operations
   */
  handleDrop(
    components: FormComponentData[],
    position: DropPosition,
    createComponent: (type: ComponentType) => FormComponentData
  ): FormComponentData[] {
    console.log('🎯 DragDropLogic.handleDrop:', position);

    // Handle existing component repositioning
    if (position.dragType === 'existing-item' && position.sourceId) {
      return this.repositionComponent(components, position);
    }

    // Handle new component creation
    const newComponent = createComponent(position.componentType);
    
    switch (position.type) {
      case 'before':
        return this.insertBefore(components, position.targetId, newComponent);
      case 'after':
        return this.insertAfter(components, position.targetId, newComponent);
      case 'inside':
        return this.insertInside(components, position.targetId, newComponent);
      case 'left':
      case 'right':
        return this.insertHorizontal(components, position.targetId, newComponent, position.type);
      case 'center':
        return this.insertCenter(components, newComponent);
      default:
        console.error('❌ Unknown drop position:', position.type);
        return components;
    }
  }

  /**
   * Reposition existing component
   */
  private repositionComponent(
    components: FormComponentData[],
    position: DropPosition
  ): FormComponentData[] {
    const sourceId = position.sourceId!;
    const targetId = position.targetId;

    // Find source component
    const sourceComponent = this.findComponentById(components, sourceId);
    if (!sourceComponent) {
      console.error('❌ Source component not found:', sourceId);
      return components;
    }

    // Remove source component
    const updatedComponents = this.removeComponent(components, sourceId);

    // Insert at new position
    switch (position.type) {
      case 'before':
        return this.insertBefore(updatedComponents, targetId, sourceComponent);
      case 'after':
        return this.insertAfter(updatedComponents, targetId, sourceComponent);
      case 'inside':
        return this.insertInside(updatedComponents, targetId, sourceComponent);
      case 'left':
      case 'right':
        return this.insertHorizontal(updatedComponents, targetId, sourceComponent, position.type);
      default:
        return updatedComponents;
    }
  }

  /**
   * Insert component before target
   */
  private insertBefore(
    components: FormComponentData[],
    targetId: string,
    newComponent: FormComponentData
  ): FormComponentData[] {
    const result: FormComponentData[] = [];
    
    for (const component of components) {
      if (component.id === targetId) {
        result.push(newComponent);
        result.push(component);
      } else if (component.type === 'horizontal_layout' && component.children) {
        const updatedChildren = this.insertBefore(component.children, targetId, newComponent);
        if (updatedChildren !== component.children) {
          result.push({ ...component, children: updatedChildren });
        } else {
          result.push(component);
        }
      } else {
        result.push(component);
      }
    }
    
    return result;
  }

  /**
   * Insert component after target
   */
  private insertAfter(
    components: FormComponentData[],
    targetId: string,
    newComponent: FormComponentData
  ): FormComponentData[] {
    const result: FormComponentData[] = [];
    
    for (const component of components) {
      result.push(component);
      if (component.id === targetId) {
        result.push(newComponent);
      } else if (component.type === 'horizontal_layout' && component.children) {
        const updatedChildren = this.insertAfter(component.children, targetId, newComponent);
        if (updatedChildren !== component.children) {
          result[result.length - 1] = { ...component, children: updatedChildren };
        }
      }
    }
    
    return result;
  }

  /**
   * Insert component inside target (for containers)
   */
  private insertInside(
    components: FormComponentData[],
    targetId: string,
    newComponent: FormComponentData
  ): FormComponentData[] {
    return components.map(component => {
      if (component.id === targetId && component.type === 'horizontal_layout') {
        return {
          ...component,
          children: [...(component.children || []), newComponent]
        };
      } else if (component.type === 'horizontal_layout' && component.children) {
        return {
          ...component,
          children: this.insertInside(component.children, targetId, newComponent)
        };
      }
      return component;
    });
  }

  /**
   * Insert component horizontally (left/right of target)
   * Improved logic to prevent race conditions and conflicts
   */
  private insertHorizontal(
    components: FormComponentData[],
    targetId: string,
    newComponent: FormComponentData,
    side: 'left' | 'right'
  ): FormComponentData[] {
    const targetIndex = components.findIndex(comp => comp.id === targetId);
    if (targetIndex === -1) return components;

    // Check if we need to recursively search in layout children
    if (components.some(comp => comp.children && comp.children.length > 0)) {
      return components.map(component => {
        if (component.type === 'horizontal_layout' && component.children) {
          const updatedChildren = this.insertHorizontal(component.children, targetId, newComponent, side);
          if (updatedChildren !== component.children) {
            return { ...component, children: updatedChildren };
          }
        }
        if (component.type === 'vertical_layout' && component.children) {
          const updatedChildren = this.insertHorizontal(component.children, targetId, newComponent, side);
          if (updatedChildren !== component.children) {
            return { ...component, children: updatedChildren };
          }
        }
        return component;
      });
    }

    const targetComponent = components[targetIndex];
    const result = [...components];

    // Check if target is already in a horizontal layout
    const parentLayout = this.findParentHorizontalLayout(components, targetId);
    
    if (parentLayout && parentLayout.children && parentLayout.children.length < 4) {
      // Add to existing horizontal layout (max 4 items)
      const targetChildIndex = parentLayout.children.findIndex(child => child.id === targetId);
      const insertIndex = side === 'left' ? targetChildIndex : targetChildIndex + 1;
      
      const updatedChildren = [...parentLayout.children];
      updatedChildren.splice(insertIndex, 0, newComponent);
      
      return components.map(comp => 
        comp.id === parentLayout.id 
          ? { ...comp, children: updatedChildren }
          : comp
      );
    } else {
      // Create new horizontal layout with proper field IDs
      const horizontalLayout: FormComponentData = {
        id: `horizontal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'horizontal_layout',
        fieldId: `horizontal_field_${Date.now()}`,
        label: 'Row Layout',
        required: false,
        helpText: undefined,
        children: side === 'left' 
          ? [newComponent, targetComponent]
          : [targetComponent, newComponent]
      };

      result[targetIndex] = horizontalLayout;
      return result;
    }
  }

  /**
   * Insert component vertically (top/bottom of target)
   * Similar to horizontal but creates vertical layouts
   */
  private insertVertical(
    components: FormComponentData[],
    targetId: string,
    newComponent: FormComponentData,
    side: 'top' | 'bottom'
  ): FormComponentData[] {
    const targetIndex = components.findIndex(comp => comp.id === targetId);
    if (targetIndex === -1) return components;

    // Check if we need to recursively search in layout children
    if (components.some(comp => comp.children && comp.children.length > 0)) {
      return components.map(component => {
        if (component.type === 'vertical_layout' && component.children) {
          const updatedChildren = this.insertVertical(component.children, targetId, newComponent, side);
          if (updatedChildren !== component.children) {
            return { ...component, children: updatedChildren };
          }
        }
        if (component.type === 'horizontal_layout' && component.children) {
          const updatedChildren = this.insertVertical(component.children, targetId, newComponent, side);
          if (updatedChildren !== component.children) {
            return { ...component, children: updatedChildren };
          }
        }
        return component;
      });
    }

    const targetComponent = components[targetIndex];
    const result = [...components];

    // Check if target is already in a vertical layout
    const parentLayout = this.findParentVerticalLayout(components, targetId);
    
    if (parentLayout && parentLayout.children && parentLayout.children.length < 6) {
      // Add to existing vertical layout (max 6 items)
      const targetChildIndex = parentLayout.children.findIndex((child: FormComponentData) => child.id === targetId);
      const insertIndex = side === 'top' ? targetChildIndex : targetChildIndex + 1;
      
      const updatedChildren = [...parentLayout.children];
      updatedChildren.splice(insertIndex, 0, newComponent);
      
      return components.map(comp => 
        comp.id === parentLayout.id 
          ? { ...comp, children: updatedChildren }
          : comp
      );
    } else {
      // Create new vertical layout with proper field IDs
      const verticalLayout: FormComponentData = {
        id: `vertical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'vertical_layout',
        fieldId: `vertical_field_${Date.now()}`,
        label: 'Column Layout',
        required: false,
        helpText: undefined,
        children: side === 'top' 
          ? [newComponent, targetComponent]
          : [targetComponent, newComponent]
      };

      result[targetIndex] = verticalLayout;
      return result;
    }
  }

  /**
   * Insert component in center (empty canvas or append)
   */
  private insertCenter(
    components: FormComponentData[],
    newComponent: FormComponentData
  ): FormComponentData[] {
    if (components.length === 0) {
      return [newComponent];
    } else {
      return [...components, newComponent];
    }
  }

  /**
   * Remove component by ID
   */
  private removeComponent(
    components: FormComponentData[],
    componentId: string
  ): FormComponentData[] {
    const result: FormComponentData[] = [];
    
    for (const component of components) {
      if (component.id === componentId) {
        // Skip this component (remove it)
        continue;
      } else if (component.type === 'horizontal_layout' && component.children) {
        const updatedChildren = this.removeComponent(component.children, componentId);
        
        if (this.config.autoDissolveEmptyLayouts && updatedChildren.length <= 1) {
          // Dissolve horizontal layout if only one child remains
          if (updatedChildren.length === 1) {
            result.push(updatedChildren[0]);
          }
          // If no children, don't add the layout
        } else {
          result.push({ ...component, children: updatedChildren });
        }
      } else {
        result.push(component);
      }
    }
    
    return result;
  }

  /**
   * Find component by ID (recursive)
   */
  private findComponentById(
    components: FormComponentData[],
    componentId: string
  ): FormComponentData | null {
    for (const component of components) {
      if (component.id === componentId) {
        return component;
      }
      if (component.type === 'horizontal_layout' && component.children) {
        const found = this.findComponentById(component.children, componentId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Find parent horizontal layout containing the given component
   */
  private findParentHorizontalLayout(
    components: FormComponentData[],
    componentId: string
  ): FormComponentData | null {
    for (const component of components) {
      if (component.type === 'horizontal_layout' && component.children) {
        const hasChild = component.children.some(child => child.id === componentId);
        if (hasChild) {
          return component;
        }
        
        // Check nested layouts
        const nestedParent = this.findParentHorizontalLayout(component.children, componentId);
        if (nestedParent) return nestedParent;
      }
    }
    return null;
  }

  /**
   * Find parent vertical layout containing the given component
   */
  private findParentVerticalLayout(
    components: FormComponentData[],
    componentId: string
  ): FormComponentData | null {
    for (const component of components) {
      if (component.type === 'vertical_layout' && component.children) {
        const hasChild = component.children.some(child => child.id === componentId);
        if (hasChild) {
          return component;
        }
        
        // Check nested layouts
        const nestedParent = this.findParentVerticalLayout(component.children, componentId);
        if (nestedParent) return nestedParent;
      }
    }
    return null;
  }

  /**
   * Calculate drop position based on mouse coordinates
   */
  calculateDropPosition(
    targetElement: HTMLElement,
    mouseX: number,
    mouseY: number,
    targetId: string,
    componentType: ComponentType,
    dragType: 'new-item' | 'existing-item' = 'new-item',
    sourceId?: string
  ): DropPosition {
    const rect = targetElement.getBoundingClientRect();
    const relativeX = mouseX - rect.left;
    const relativeY = mouseY - rect.top;
    
    const xPercent = relativeX / rect.width;
    const yPercent = relativeY / rect.height;

    // Determine drop position based on mouse position
    if (yPercent < 0.3) {
      return { type: 'before', targetId, componentType, dragType, sourceId };
    } else if (yPercent > 0.7) {
      return { type: 'after', targetId, componentType, dragType, sourceId };
    } else if (xPercent < 0.25) {
      return { type: 'left', targetId, componentType, dragType, sourceId };
    } else if (xPercent > 0.75) {
      return { type: 'right', targetId, componentType, dragType, sourceId };
    } else {
      return { type: 'inside', targetId, componentType, dragType, sourceId };
    }
  }

  /**
   * Get visual feedback for drop position
   */
  getDropFeedback(position: DropPosition): {
    indicator: string;
    className: string;
    description: string;
  } {
    const feedbackMap = {
      before: {
        indicator: '↑',
        className: 'drop-before',
        description: 'Insert above'
      },
      after: {
        indicator: '↓',
        className: 'drop-after',
        description: 'Insert below'
      },
      left: {
        indicator: '←',
        className: 'drop-left',
        description: 'Place side-by-side (left)'
      },
      right: {
        indicator: '→',
        className: 'drop-right',
        description: 'Place side-by-side (right)'
      },
      inside: {
        indicator: '⊕',
        className: 'drop-inside',
        description: 'Add to container'
      },
      center: {
        indicator: '⊙',
        className: 'drop-center',
        description: 'Add to canvas'
      }
    };

    return feedbackMap[position.type] || {
      indicator: '?',
      className: 'drop-unknown',
      description: 'Unknown position'
    };
  }

  /**
   * Validate drop operation
   */
  validateDrop(
    components: FormComponentData[],
    position: DropPosition
  ): { valid: boolean; reason?: string } {
    // Prevent dropping component on itself
    if (position.dragType === 'existing-item' && position.sourceId === position.targetId) {
      return { valid: false, reason: 'Cannot drop component on itself' };
    }

    // Prevent dropping parent into its own child
    if (position.dragType === 'existing-item' && position.sourceId) {
      const isDescendant = this.isDescendant(components, position.sourceId, position.targetId);
      if (isDescendant) {
        return { valid: false, reason: 'Cannot drop parent into its own child' };
      }
    }

    return { valid: true };
  }

  /**
   * Check if target is a descendant of source
   */
  private isDescendant(
    components: FormComponentData[],
    sourceId: string,
    targetId: string
  ): boolean {
    const sourceComponent = this.findComponentById(components, sourceId);
    if (!sourceComponent || sourceComponent.type !== 'horizontal_layout') {
      return false;
    }

    const checkChildren = (children: FormComponentData[]): boolean => {
      for (const child of children) {
        if (child.id === targetId) {
          return true;
        }
        if (child.type === 'horizontal_layout' && child.children) {
          if (checkChildren(child.children)) {
            return true;
          }
        }
      }
      return false;
    };

    return sourceComponent.children ? checkChildren(sourceComponent.children) : false;
  }

  /**
   * Get configuration
   */
  getConfig(): DragDropConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<DragDropConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
