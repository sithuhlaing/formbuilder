/**
 * SOLID PRINCIPLE REFACTORING - Interface Segregation
 * Segregated interfaces following ISP - components only depend on what they need
 */

import type { ValidationRule, ConditionalRule } from '../../types/component';

// Component type definitions
export type ComponentType = 
  // Input Components
  | "text_input"
  | "email_input"
  | "password_input"
  | "number_input"
  | "textarea"
  | "rich_text"
  
  // Selection Components  
  | "select"
  | "multi_select"
  | "checkbox"
  | "checkbox_group"
  | "radio_group"
  
  // Special Components
  | "date_picker"
  | "file_upload"
  | "signature"
  
  // Layout Components
  | "horizontal_layout"
  | "vertical_layout"
  
  // UI Components
  | "section_divider"
  | "button"
  | "heading"
  | "paragraph"
  | "divider"
  | "card";

// Base interface - only essential properties all components need
export interface BaseComponent {
  id: string;
  type: ComponentType;
  label: string;
  fieldId: string;
  required: boolean;
  helpText?: string;
}

// Input-specific interface
export interface InputComponent extends BaseComponent {
  placeholder?: string;
  defaultValue?: string | number | boolean | string[];
  pattern?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

// Validation interface - only for components that need validation
export interface ValidatableComponent {
  validationRules: ValidationRule[];
}

// Options interface - only for choice-based components  
export interface OptionsComponent extends BaseComponent {
  options: Array<{label: string; value: string}>;
}

// Numeric interface - only for number inputs
export interface NumericComponent extends InputComponent {
  min?: number;
  max?: number;
  step?: number;
}

// Container interface - only for layout components
export interface ContainerComponent extends BaseComponent {
  children: FormComponentData[];
}

// Conditional interface - only for components with conditional logic
export interface ConditionalComponent {
  conditionalDisplay: {
    showWhen?: ConditionalRule;
    hideWhen?: ConditionalRule;
  };
}

// File upload interface - only for file components
export interface FileComponent extends InputComponent {
  acceptedFileTypes?: string;
  accept?: string;
  multiple?: boolean;
}

// Textarea interface - only for textarea components
export interface TextareaComponent extends InputComponent {
  rows?: number;
  cols?: number;
  minLength?: number;
  maxLength?: number;
}

// Styled interface - only for components with custom styling
export interface StyledComponent {
  styling: {
    className?: string;
    customCSS?: string;
    width?: string;
    height?: string;
    theme?: string;
  };
}

// Positioned interface - only for components with positioning
export interface PositionedComponent {
  position: {
    x: number;
    y: number;
    row?: number;
    column?: number;
  };
}

// Heading interface - only for heading components
export interface HeadingComponent extends BaseComponent {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

// Additional properties for compatibility with types/component.ts
export interface CompatibilityComponent {
  content: string;
  description: (arg0: string, description: any, arg2: string) => React.ReactNode;
  alignment: 'left' | 'center' | 'right' | 'justify';
}

// Composite type for full component data - intersection of needed interfaces
export type FormComponentData = BaseComponent & 
  Partial<InputComponent> & 
  Partial<ValidatableComponent> & 
  Partial<OptionsComponent> & 
  Partial<NumericComponent> & 
  Partial<ContainerComponent> & 
  Partial<ConditionalComponent> & 
  Partial<FileComponent> & 
  Partial<TextareaComponent> & 
  Partial<StyledComponent> & 
  Partial<PositionedComponent> & 
  Partial<HeadingComponent> & 
  Partial<CompatibilityComponent>;

// Specific component type definitions - composition interfaces
// These interfaces combine multiple base interfaces for type safety
 
export interface TextInputComponent extends BaseComponent, InputComponent, ValidatableComponent, ConditionalComponent {}
 
export interface EmailInputComponent extends BaseComponent, InputComponent, ValidatableComponent, ConditionalComponent {}
 
export interface NumberInputComponent extends BaseComponent, NumericComponent, ValidatableComponent, ConditionalComponent {}
 
export interface SelectComponent extends BaseComponent, OptionsComponent, ValidatableComponent, ConditionalComponent {}
 
export interface FileUploadComponent extends BaseComponent, FileComponent, ValidatableComponent, ConditionalComponent {}
 
export interface LayoutComponent extends BaseComponent, ContainerComponent, StyledComponent, PositionedComponent {}