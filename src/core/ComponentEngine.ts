
/**
 * ALIGNED WITH DOCUMENTATION - Component Engine
 * Supports exactly 15 component types as specified in business requirements
 */

import type { ComponentType, Component } from '../types';

export class ComponentEngine {
  private static readonly SUPPORTED_TYPES: ComponentType[] = [
    'text_input', 'email_input', 'number_input', 'textarea',
    'select', 'radio_group', 'checkbox', 'date_picker', 'file_upload',
    'horizontal_layout', 'vertical_layout', 'button', 'heading', 'paragraph', 
    'divider', 'section_divider'
  ];

  static getSupportedTypes(): ComponentType[] {
    return [...this.SUPPORTED_TYPES];
  }

  static createComponent(type: ComponentType): Component {
    if (!this.SUPPORTED_TYPES.includes(type)) {
      throw new Error(`Unsupported component type: ${type}`);
    }

    const baseComponent: Component = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: this.getDefaultLabel(type),
      required: false
    };

    return this.enhanceComponent(baseComponent);
  }

  private static getDefaultLabel(type: ComponentType): string {
    const labelMap: Record<ComponentType, string> = {
      text_input: 'Text Input',
      email_input: 'Email Address',
      number_input: 'Number',
      textarea: 'Text Area',
      select: 'Select Option',
      checkbox: 'Checkbox',
      radio_group: 'Radio Group',
      date_picker: 'Date Picker',
      file_upload: 'File Upload',
      horizontal_layout: 'Horizontal Layout',
      vertical_layout: 'Vertical Layout',
      button: 'Button',
      heading: 'Heading',
      paragraph: 'Paragraph',
      divider: 'Divider',
      section_divider: 'Section Divider'
    };

    return labelMap[type] || 'Unknown Component';
  }

  private static enhanceComponent(component: Component): Component {
    // Add type-specific enhancements
    switch (component.type) {
      case 'select':
      case 'radio_group':
        return {
          ...component,
          options: [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' }
          ]
        };
      
      case 'file_upload':
        return {
          ...component,
          acceptedFileTypes: ['image/*', '.pdf', '.doc', '.docx'],
          maxFileSize: 5 * 1024 * 1024 // 5MB
        };
      
      default:
        return component;
    }
  }

  static validateComponent(component: Component): boolean {
    return this.SUPPORTED_TYPES.includes(component.type) && 
           component.id && 
           component.label;
  }
}
