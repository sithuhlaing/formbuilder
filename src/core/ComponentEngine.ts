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
          options: ['Option 1', 'Option 2', 'Option 3']
        };
      
      case 'multi_select':
        return { 
          ...baseComponent, 
          options: ['Option 1', 'Option 2', 'Option 3']
        };
      
      case 'radio_group':
        return { 
          ...baseComponent, 
          options: ['Option 1', 'Option 2', 'Option 3']
        };
      
      case 'file_upload':
        return { ...baseComponent, acceptedFileTypes: '*' };
      
      case 'button':
        return { 
          ...baseComponent, 
          buttonType: 'primary',
          buttonText: 'Click Me'
        };
      
      case 'heading':
        return { 
          ...baseComponent, 
          level: 1,
          text: 'Heading Text'
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
      
      case 'card':
        return { 
          ...baseComponent, 
          children: [
            // Buttons first at top level
            { 
              id: `button_${Date.now()}_1`, 
              type: 'button' as ComponentType, 
              label: 'Primary Action', 
              buttonType: 'primary', 
              required: false 
            },
            { 
              id: `button_${Date.now()}_2`, 
              type: 'button' as ComponentType, 
              label: 'Secondary Action', 
              buttonType: 'secondary', 
              required: false 
            },
            // Title after buttons
            { 
              id: `title_${Date.now()}`, 
              type: 'heading' as ComponentType, 
              label: 'Card Title', 
              level: 2, 
              required: false 
            }
          ]
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
    if (!type) {
      console.error('❌ ComponentEngine.getDefaultLabel: type is undefined');
      return 'Form Component';
    }

    const labels: Record<ComponentType, string> = {
      text_input: 'Text Input Field',
      email_input: 'Email Input Field',
      password_input: 'Password Field',
      number_input: 'Number Input Field', 
      textarea: 'Textarea Field',
      rich_text: 'Rich Text Field',
      select: 'Select Field',
      multi_select: 'Multi Select Field',
      checkbox: 'Checkbox Field',
      radio_group: 'Radio Group Field',
      date_picker: 'Date Field',
      file_upload: 'File Upload Field',
      section_divider: 'Section Divider',
      signature: 'Signature Field',
      button: 'Button',
      heading: 'Heading',
      horizontal_layout: 'Horizontal Layout',
      vertical_layout: 'Vertical Layout',
      card: 'Card'
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