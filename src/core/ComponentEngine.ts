/**
 * SINGLE SOURCE OF TRUTH for ALL component operations
 * Convergence: All component logic in ONE place
 * Business Logic: Exactly what the requirements need
 */

import type { FormComponentData, ComponentType } from '../types';
import { generateId } from '../shared/utils';

export class ComponentEngine {
  
  /**
   * SINGLE method to create ANY component
   * Replaces: componentOperations, layoutOperations, factories
   */
  static createComponent(type: ComponentType): FormComponentData {
    const baseComponent: FormComponentData = {
      id: generateId(),
      type,
      label: this.getDefaultLabel(type),
      fieldId: `field_${Date.now()}`,
      required: false,
      placeholder: this.getDefaultPlaceholder(type),
    };

    // Type-specific customization in ONE place
    switch (type) {
      case 'text_input':
        return { ...baseComponent, label: 'Text Input' };
      
      case 'email_input':
        return { ...baseComponent, label: 'Email Input', placeholder: 'Enter email...' };
      
      case 'password_input':
        return { ...baseComponent, label: 'Password Input', placeholder: 'Enter password...' };
      
      case 'number_input':
        return { ...baseComponent, label: 'Number Input', placeholder: 'Enter number...', min: 0, max: 100 };
      
      case 'textarea':
        return { ...baseComponent, label: 'Text Area', rows: 4 };
      
      case 'select':
        return { 
          ...baseComponent, 
          label: 'Select Dropdown',
          options: ['Option 1', 'Option 2', 'Option 3']
        };
      
      case 'multi_select':
        return { 
          ...baseComponent, 
          label: 'Multi-Select',
          options: ['Option 1', 'Option 2', 'Option 3']
        };
      
      case 'checkbox':
        return { ...baseComponent, label: 'Checkbox' };
      
      case 'radio_group':
        return { 
          ...baseComponent, 
          label: 'Radio Group',
          options: ['Option 1', 'Option 2', 'Option 3']
        };
      
      case 'date_picker':
        return { ...baseComponent, label: 'Date Picker' };
      
      case 'file_upload':
        return { ...baseComponent, label: 'File Upload', acceptedFileTypes: '*' };
      
      case 'section_divider':
        return { ...baseComponent, label: 'Section Divider' };
      
      case 'signature':
        return { ...baseComponent, label: 'Digital Signature' };
      
      case 'horizontal_layout':
        return { 
          ...baseComponent, 
          label: 'Horizontal Layout',
          children: []
        };
      
      case 'vertical_layout':
        return { 
          ...baseComponent, 
          label: 'Vertical Layout',
          children: []
        };
      
      default:
        return baseComponent;
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
   */
  static removeComponent(
    components: FormComponentData[], 
    componentId: string
  ): FormComponentData[] {
    return components
      .filter(component => component.id !== componentId)
      .map(component => {
        if (component.children) {
          return {
            ...component,
            children: this.removeComponent(component.children, componentId)
          };
        }
        return component;
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
   * SINGLE method to validate ANY component
   * Business logic: Exactly what requirements need
   */
  static validateComponent(component: FormComponentData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required validation
    if (!component.label?.trim()) {
      errors.push('Label is required');
    }
    
    // Type-specific validation
    switch (component.type) {
      case 'select':
      case 'multi_select':
      case 'radio_group':
        if (!component.options || component.options.length === 0) {
          errors.push('At least one option is required');
        }
        break;
        
      case 'number_input':
        if (component.min !== undefined && component.max !== undefined) {
          if (component.min >= component.max) {
            errors.push('Minimum value must be less than maximum value');
          }
        }
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Private helpers - all in ONE place
  private static getDefaultLabel(type: ComponentType): string {
    const labels: Record<ComponentType, string> = {
      text_input: 'Text Input',
      email_input: 'Email Input',
      password_input: 'Password Input',
      number_input: 'Number Input', 
      textarea: 'Text Area',
      rich_text: 'Rich Text',
      select: 'Select Dropdown',
      multi_select: 'Multi-Select',
      checkbox: 'Checkbox',
      radio_group: 'Radio Group',
      date_picker: 'Date Picker',
      file_upload: 'File Upload',
      section_divider: 'Section Divider',
      signature: 'Digital Signature',
      horizontal_layout: 'Horizontal Layout',
      vertical_layout: 'Vertical Layout'
    };
    
    return labels[type] || 'Form Component';
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