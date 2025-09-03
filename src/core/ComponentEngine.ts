/**
 * SOLID PRINCIPLE REFACTORING - Single Responsibility & Open/Closed
 * ComponentEngine now focuses ONLY on component operations
 * Uses ComponentRegistry for creation (Open/Closed Principle)
 */

import type { ComponentType, ValidationResult } from '../types';
import type { FormComponentData } from './interfaces/ComponentInterfaces';
import { ComponentRegistry } from './ComponentRegistry';
import { ComponentValidationEngine } from './ComponentValidationEngine';
import { generateId } from '../shared/utils';

export class ComponentEngine {
  
  /**
   * SOLID REFACTORING - Delegates to ComponentRegistry (Open/Closed Principle)
   * No more switch statements - new component types can be added without modifying this code
   */
  static createComponent(type: ComponentType): FormComponentData {
    // Defensive programming - ensure we have a valid type
    if (!type) {
      console.error('❌ ComponentEngine.createComponent: type is undefined');
      type = 'text_input'; // fallback
    }

    const baseData = {
      id: generateId(),
      label: ComponentEngine.getDefaultLabel(type),
      fieldId: `field_${Date.now()}`,
      required: false
    };

    try {
      return ComponentRegistry.createComponent(type, baseData);
    } catch (error) {
      console.error('❌ ComponentEngine.createComponent: Failed to create component', error);
      // Fallback to text input
      return ComponentRegistry.createComponent('text_input', baseData);
    }
  }

  /**
   * SINGLE method to update ANY component
   * Replaces: scattered update logic
   */
  static updateComponent(
    components: FormComponentData[], 
    componentId: string, 
    updates: Partial<FormComponentData>
  ): FormComponentData[] {
    return components.map(component => {
      if (component.id === componentId) {
        return { ...component, ...updates };
      }
      
      // Handle nested components
      if (component.children) {
        return {
          ...component,
          children: this.updateComponent(component.children, componentId, updates)
        };
      }
      
      return component;
    });
  }

  /**
   * SINGLE method to remove ANY component
   * Replaces: scattered delete logic
   * Includes row layout dissolution when only one child remains
   */
  static removeComponent(
    components: FormComponentData[], 
    componentId: string
  ): FormComponentData[] {
    return components
      .filter(component => component.id !== componentId)
      .map(component => {
        if (component.children) {
          const updatedChildren = this.removeComponent(component.children, componentId);
          
          // Row layout dissolution rule: if only one child remains, replace with the child
          if (component.type === 'horizontal_layout' && updatedChildren.length === 1) {
            console.log('🔄 Dissolving row layout with single child:', component.id);
            return updatedChildren[0];
          }
          
          return {
            ...component,
            children: updatedChildren
          };
        }
        return component;
      })
      .filter(component => {
        // Also handle top-level row layout dissolution
        if (component.type === 'horizontal_layout' && component.children && component.children.length === 1) {
          console.log('🔄 Dissolving top-level row layout with single child:', component.id);
          return false; // Remove the row layout - it will be replaced by its child
        }
        return true;
      })
      .flatMap(component => {
        // Replace dissolved row layouts with their single child
        if (component.type === 'horizontal_layout' && component.children && component.children.length === 1) {
          return [component.children[0]];
        }
        return [component];
      });
  }

  /**
   * SINGLE method to find ANY component
   * Replaces: scattered find logic
   */
  static findComponent(
    components: FormComponentData[], 
    componentId: string
  ): FormComponentData | null {
    for (const component of components) {
      if (component.id === componentId) {
        return component;
      }
      
      if (component.children) {
        const found = this.findComponent(component.children, componentId);
        if (found) return found;
      }
    }
    
    return null;
  }

  /**
   * SOLID REFACTORING - Delegates to ComponentRegistry
   * Component types are now managed centrally
   */
  static getAllComponentTypes(): ComponentType[] {
    return ComponentRegistry.getSupportedTypes();
  }

  /**
   * SOLID REFACTORING - Delegates to ComponentValidationEngine (Single Responsibility)
   * Validation logic is now separated for better maintainability
   */
  static validateComponent(component: FormComponentData): ValidationResult {
    // Import here to avoid circular dependency
     
    return ComponentValidationEngine.validateComponent(component);
  }

  // Private helpers - all in ONE place
  public static getDefaultLabel(type: ComponentType): string {
    if (!type) {
      console.error('❌ ComponentEngine.getDefaultLabel: type is undefined');
      return 'Form Component';
    }

    const labels: Record<ComponentType, string> = {
      text_input: 'Text Input',
      email_input: 'Email Input',
      password_input: 'Password Input',
      number_input: 'Number Input', 
      textarea: 'Text Area',
      rich_text: 'Rich Text',
      select: 'Select',
      multi_select: 'Multi Select',
      checkbox: 'Checkbox',
      radio_group: 'Radio Group',
      date_picker: 'Date Picker',
      file_upload: 'File Upload',
      section_divider: 'Section Divider',
      signature: 'Signature',
      horizontal_layout: 'Horizontal Layout',
      vertical_layout: 'Vertical Layout'
    };
    
    const label = labels[type];
    if (!label) {
      console.warn('⚠️ ComponentEngine.getDefaultLabel: Unknown type', type);
      return 'Form Component';
    }
    
    return label;
  }

  private static getDefaultPlaceholder(type: ComponentType): string {
    const placeholders: Partial<Record<ComponentType, string>> = {
      text_input: 'Enter text...',
      email_input: 'Enter email address...',
      password_input: 'Enter password...',
      number_input: 'Enter a number...',
      textarea: 'Enter your message...',
      select: 'Choose an option...',
      multi_select: 'Choose options...',
      date_picker: 'Select date...',
      file_upload: 'Click to upload files...'
    };
    
    return placeholders[type] || 'Enter value...';
  }
}