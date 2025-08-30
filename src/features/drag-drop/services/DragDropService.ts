/**
 * Single Responsibility: Handle ALL drag-drop operations
 * Clean, simple, crystal clear implementation
 */

import type { FormComponentData, ComponentType } from '../../../types/component';

export interface DropPosition {
  type: 'before' | 'after' | 'inside' | 'left' | 'right' | 'center';
  targetId: string;
  componentType: ComponentType;
}

export class DragDropService {
  
  /**
   * Single method to handle ANY drop operation
   * Simple, clear business logic
   */
  static handleDrop(
    components: FormComponentData[],
    position: DropPosition,
    createComponent: (type: ComponentType) => FormComponentData
  ): FormComponentData[] {
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
        // Handle center drops - for empty canvas, just add the component
        if (components.length === 0) {
          return [newComponent];
        } else {
          // For populated canvas, append to end
          return [...components, newComponent];
        }
      
      default:
        console.error('❌ Unknown drop position:', position.type);
        return components;
    }
  }

  /**
   * Crystal clear: Insert component before target
   */
  private static insertBefore(
    components: FormComponentData[], 
    targetId: string, 
    newComponent: FormComponentData
  ): FormComponentData[] {
    const result = [...components];
    
    for (let i = 0; i < result.length; i++) {
      if (result[i].id === targetId) {
        result.splice(i, 0, newComponent);
        return result;
      }
    }
    
    console.warn('⚠️ Target not found, appending to end');
    result.push(newComponent);
    return result;
  }

  /**
   * Crystal clear: Insert component after target  
   */
  private static insertAfter(
    components: FormComponentData[], 
    targetId: string, 
    newComponent: FormComponentData
  ): FormComponentData[] {
    const result = [...components];
    
    for (let i = 0; i < result.length; i++) {
      if (result[i].id === targetId) {
        result.splice(i + 1, 0, newComponent);
        return result;
      }
    }
    
    console.warn('⚠️ Target not found, appending to end');
    result.push(newComponent);
    return result;
  }

  /**
   * Crystal clear: Insert component inside target (container)
   */
  private static insertInside(
    components: FormComponentData[], 
    targetId: string, 
    newComponent: FormComponentData
  ): FormComponentData[] {
    return components.map(component => {
      if (component.id === targetId) {
        const children = component.children || [];
        return {
          ...component,
          children: [...children, newComponent]
        };
      }
      
      // Recursively check children
      if (component.children) {
        return {
          ...component,
          children: this.insertInside(component.children, targetId, newComponent)
        };
      }
      
      return component;
    });
  }

  /**
   * Crystal clear: Create horizontal layout
   */
  private static insertHorizontal(
    components: FormComponentData[], 
    targetId: string, 
    newComponent: FormComponentData,
    side: 'left' | 'right'
  ): FormComponentData[] {
    return components.map(component => {
      if (component.id === targetId) {
        // Create new horizontal layout
        const horizontalLayout: FormComponentData = {
          id: `row_${Date.now()}`,
          type: 'horizontal_layout',
          label: 'Row Layout',
          fieldId: `row_${Date.now()}`,
          children: side === 'left' 
            ? [newComponent, component] 
            : [component, newComponent]
        };
        
        return horizontalLayout;
      }
      
      return component;
    });
  }

  /**
   * Simple validation: Can drop here?
   */
  static canDrop(targetId: string, componentType: ComponentType): boolean {
    // Simple business rules
    if (!targetId || !componentType) return false;
    
    // Add more specific rules as needed
    return true;
  }
}