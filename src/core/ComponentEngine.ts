/**
 * SINGLE SOURCE OF TRUTH for ALL component operations
 * Convergence: All component logic in ONE place
 * Business Logic: Exactly what the requirements need
 */

import type { FormComponentData, ComponentType, ValidationResult, ValidationRule } from '../types';
import { generateId } from '../shared/utils';

export class ComponentEngine {
  
  /**
   * SINGLE method to create ANY component
   * Replaces: componentOperations, layoutOperations, factories
   */
  static createComponent(type: ComponentType): FormComponentData {
    // Defensive programming - ensure we have a valid type
    if (!type) {
      console.error('❌ ComponentEngine.createComponent: type is undefined');
      type = 'text_input'; // fallback
    }

    const baseComponent: FormComponentData = {
      id: generateId(),
      type,
      label: ComponentEngine.getDefaultLabel(type),
      fieldId: `field_${Date.now()}`,
      required: false,
      placeholder: ComponentEngine.getDefaultPlaceholder(type),
      validationRules: [],
      conditionalDisplay: {}
    };

    // Type-specific customization in ONE place - keep defaults from getDefaultLabel but add type-specific props
    switch (type) {
      case 'email_input':
        return { ...baseComponent, placeholder: 'Enter email...' };
      
      case 'password_input':
        return { ...baseComponent, placeholder: 'Enter password...' };
      
      case 'number_input':
        return { ...baseComponent, placeholder: 'Enter number...', min: 0, max: 100 };
      
      case 'select':
        return { 
          ...baseComponent, 
          options: [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3', value: 'option3' }
          ]
        };
      
      case 'multi_select':
        return { 
          ...baseComponent, 
          options: [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3', value: 'option3' }
          ]
        };
      
      case 'radio_group':
        return { 
          ...baseComponent, 
          options: [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3', value: 'option3' }
          ]
        };
      
      case 'file_upload':
        return { ...baseComponent, acceptedFileTypes: '*' };
      
      case 'rich_text':
        return { 
          ...baseComponent, 
          defaultValue: '<p>Click here to start editing with <strong>bold</strong>, <em>italic</em> and more formatting options!</p>',
          placeholder: 'Enter rich text content...'
        };
      
      
      case 'horizontal_layout':
        return { 
          ...baseComponent, 
          children: []
        };
      
      case 'vertical_layout':
        return { 
          ...baseComponent, 
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
   * Get all available component types
   * Used by CanvasManager for cross-domain filtering
   */
  static getAllComponentTypes(): ComponentType[] {
    return [
      'text_input',
      'email_input', 
      'password_input',
      'number_input',
      'textarea',
      'rich_text',
      'select',
      'multi_select',
      'checkbox',
      'radio_group',
      'date_picker',
      'file_upload',
      'section_divider',
      'signature',
      'horizontal_layout',
      'vertical_layout'
    ];
  }

  /**
   * SINGLE method to validate ANY component
   * Business logic: Exactly what requirements need
   */
  static validateComponent(component: FormComponentData): ValidationResult {
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
      isValid: errors.length === 0,
      errors,
      message: errors.join(', ')
    };
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