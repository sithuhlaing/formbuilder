/**
 * SOLID PRINCIPLE REFACTORING - Interface Segregation
 * Segregated interfaces following ISP - components only depend on what they need
 */

import type { ValidationRule, ConditionalRule } from '../../types/component';
import type { ComponentLayout } from '../../types/layout';

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

// UNIFIED LAYOUT SYSTEM - replaces StyledComponent and PositionedComponent
// Uses comprehensive ComponentLayout from types/layout.ts
export interface LayoutEnhancedComponent {
  layout?: ComponentLayout;
  
  // Legacy support - will be merged into layout system
  styling?: {
    className?: string;
    theme?: string;
  };
}

// Heading interface - only for heading components
export interface HeadingComponent extends BaseComponent, LayoutEnhancedComponent {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
}

// Button interface - only for button components
export interface ButtonComponent extends BaseComponent, LayoutEnhancedComponent {
  buttonType?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// Card interface - only for card components
export interface CardComponent extends BaseComponent, LayoutEnhancedComponent {
  variant?: 'elevated' | 'outlined' | 'filled';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  borderColor?: string;
  backgroundColor?: string;
  showHeader?: boolean;
  headerAlign?: 'left' | 'center' | 'right';
  showFooter?: boolean;
  footerAlign?: 'left' | 'center' | 'right';
  children?: FormComponentData[];
}

// Additional properties for compatibility with types/component.ts
export interface CompatibilityComponent {
  content: string;
  description: (arg0: string, description: any, arg2: string) => React.ReactNode;
  alignment: 'left' | 'center' | 'right' | 'justify';
}

// Base interface for all components with common properties
export interface BaseComponentWithProps extends BaseComponent {
  className?: string;
  style?: React.CSSProperties;
  key?: string | number;
}

// Composite type for full component data - intersection of needed interfaces
export type FormComponentData = BaseComponentWithProps &
  Partial<InputComponent> &
  Partial<ValidatableComponent> &
  Partial<OptionsComponent> &
  Partial<NumericComponent> &
  Partial<ContainerComponent> &
  Partial<ConditionalComponent> &
  Partial<FileComponent> &
  Partial<TextareaComponent> &
  Partial<LayoutEnhancedComponent> &
  Partial<HeadingComponent> &
  Partial<ButtonComponent> &
  Partial<CardComponent> &
  Partial<CompatibilityComponent> & {
    // Card component specific properties
    variant?: 'elevated' | 'outlined' | 'filled';
    padding?: string | number;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    borderColor?: string;
    backgroundColor?: string;
    showHeader?: boolean;
    headerAlign?: 'left' | 'center' | 'right';
    showFooter?: boolean;
    footerAlign?: 'left' | 'center' | 'right';
  };

// Specific component type definitions - composition interfaces
// These interfaces combine multiple base interfaces for type safety
 
export interface TextInputComponent extends BaseComponent, InputComponent, ValidatableComponent, ConditionalComponent {}
 
export interface EmailInputComponent extends BaseComponent, InputComponent, ValidatableComponent, ConditionalComponent {}
 
export interface NumberInputComponent extends BaseComponent, NumericComponent, ValidatableComponent, ConditionalComponent {}
 
export interface SelectComponent extends BaseComponent, OptionsComponent, ValidatableComponent, ConditionalComponent {}
 
export interface FileUploadComponent extends BaseComponent, FileComponent, ValidatableComponent, ConditionalComponent {}
 
export interface LayoutComponent extends BaseComponent, ContainerComponent, LayoutEnhancedComponent {}