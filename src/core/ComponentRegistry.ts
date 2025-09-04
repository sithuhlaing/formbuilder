/**
 * SOLID PRINCIPLE REFACTORING - Open/Closed Principle
 * Component registry allows adding new component types without modifying existing code
 */

import type { ComponentType } from '../types';
import type { FormComponentData } from './interfaces/ComponentInterfaces';

// Factory interface for creating components
export interface ComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData;
  getDefaultProperties(): Partial<FormComponentData>;
}

// Base factory implementation
abstract class BaseComponentFactory implements ComponentFactory {
  abstract create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData;
  
  getDefaultProperties(): Partial<FormComponentData> {
    return {};
  }
}

// Input field factories
class TextInputFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'text_input' as ComponentType,
      placeholder: 'Enter text here...',
      defaultValue: '',
      validationRules: []
    };
  }
}

class EmailInputFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'email_input' as ComponentType,
      placeholder: 'Enter email address...',
      defaultValue: '',
      validationRules: [{ type: 'email', message: 'Please enter a valid email address' }]
    };
  }
}

class PasswordInputFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'password_input' as ComponentType,
      placeholder: 'Enter password...',
      defaultValue: '',
      validationRules: [{ type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }]
    };
  }
}

class NumberInputFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'number_input' as ComponentType,
      placeholder: 'Enter number...',
      defaultValue: 0,
      min: undefined,
      max: undefined,
      step: 1,
      validationRules: [{ type: 'number', message: 'Please enter a valid number' }]
    };
  }
}

class TextareaFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'textarea' as ComponentType,
      placeholder: 'Enter your message...',
      defaultValue: '',
      rows: 4,
      validationRules: []
    };
  }
}

class RichTextFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'rich_text' as ComponentType,
      placeholder: 'Enter rich text content...',
      defaultValue: '<p>Click here to start editing with <strong>bold</strong>, <em>italic</em> and more formatting options!</p>',
      height: '200px',
      validationRules: []
    };
  }
}

// Choice field factories
class SelectFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'select' as ComponentType,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
      ],
      defaultValue: '',
      validationRules: []
    };
  }
}

class MultiSelectFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'multi_select' as ComponentType,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
      ],
      defaultValue: [],
      validationRules: []
    };
  }
}

class CheckboxFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'checkbox' as ComponentType,
      defaultValue: false,
      validationRules: []
    };
  }
}

class RadioGroupFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'radio_group' as ComponentType,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
      ],
      defaultValue: '',
      validationRules: []
    };
  }
}

// Special field factories
class DatePickerFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'date_picker' as ComponentType,
      placeholder: 'Select date...',
      defaultValue: '',
      validationRules: [{ type: 'date', message: 'Please select a valid date' }]
    };
  }
}

class FileUploadFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'file_upload' as ComponentType,
      acceptedFileTypes: '*',
      multiple: false,
      validationRules: [{ type: 'file', message: 'Please select a valid file' }]
    };
  }
}

class SignatureFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'signature' as ComponentType,
      placeholder: 'Click to sign...',
      defaultValue: '',
      validationRules: [{ type: 'signature', message: 'Please provide your signature' }]
    };
  }
}

// Layout factories
class SectionDividerFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'section_divider' as ComponentType,
      required: false, // Dividers are never required
      styling: {
        className: 'section-divider',
        customCSS: '',
        width: '100%',
        height: 'auto'
      }
    };
  }
}

class HorizontalLayoutFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'horizontal_layout' as ComponentType,
      required: false, // Layout containers are never required
      children: [],
      styling: {
        className: 'horizontal-layout',
        customCSS: 'display: flex; flex-direction: row; gap: 16px;',
        width: '100%',
        height: 'auto'
      }
    };
  }
}

class VerticalLayoutFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'vertical_layout' as ComponentType,
      required: false, // Layout containers are never required
      children: [],
      styling: {
        className: 'vertical-layout',
        customCSS: 'display: flex; flex-direction: column; gap: 16px;',
        width: '100%',
        height: 'auto'
      }
    };
  }
}

// UI Component factories
class ButtonFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'button' as ComponentType,
      required: false, // Buttons are not form inputs
      defaultValue: baseData.label || 'Click Me',
      styling: {
        className: 'form-button',
        customCSS: '',
        theme: 'primary'
      }
    };
  }
}

class HeadingFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'heading' as ComponentType,
      required: false, // Headings are not form inputs
      defaultValue: baseData.label || 'Section Heading',
      styling: {
        className: 'form-heading',
        customCSS: '',
        theme: 'default'
      }
    };
  }
}

class CardFactory extends BaseComponentFactory {
  create(baseData: { id: string; label: string; fieldId: string; required: boolean }): FormComponentData {
    return {
      ...baseData,
      type: 'card' as ComponentType,
      required: false, // Cards are containers, not form inputs
      children: [],
      styling: {
        className: 'form-card',
        customCSS: 'padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: white;',
        width: '100%',
        height: 'auto'
      }
    };
  }
}

// Component Registry - Open/Closed Principle implementation
export class ComponentRegistry {
  private static factories = new Map<ComponentType, ComponentFactory>([
    ['text_input', new TextInputFactory()],
    ['email_input', new EmailInputFactory()],
    ['password_input', new PasswordInputFactory()],
    ['number_input', new NumberInputFactory()],
    ['textarea', new TextareaFactory()],
    ['rich_text', new RichTextFactory()],
    ['select', new SelectFactory()],
    ['multi_select', new MultiSelectFactory()],
    ['checkbox', new CheckboxFactory()],
    ['radio_group', new RadioGroupFactory()],
    ['date_picker', new DatePickerFactory()],
    ['file_upload', new FileUploadFactory()],
    ['signature', new SignatureFactory()],
    ['section_divider', new SectionDividerFactory()],
    ['horizontal_layout', new HorizontalLayoutFactory()],
    ['vertical_layout', new VerticalLayoutFactory()],
    ['button', new ButtonFactory()],
    ['heading', new HeadingFactory()],
    ['card', new CardFactory()]
  ]);

  static registerFactory(type: ComponentType, factory: ComponentFactory): void {
    this.factories.set(type, factory);
  }

  static createComponent(
    type: ComponentType,
    baseData: { id: string; label: string; fieldId: string; required: boolean }
  ): FormComponentData {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`No factory registered for component type: ${type}`);
    }
    return factory.create(baseData);
  }

  static getDefaultProperties(type: ComponentType): Partial<FormComponentData> {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`No factory registered for component type: ${type}`);
    }
    return factory.getDefaultProperties();
  }

  static getSupportedTypes(): ComponentType[] {
    return Array.from(this.factories.keys());
  }
}