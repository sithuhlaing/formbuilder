/**
 * SOLID PRINCIPLE REFACTORING - Interface Segregation
 * Segregated interfaces following ISP - components only depend on what they need
 */

import type { ComponentType, ValidationRule, ConditionalRule } from '../../types';

// Base interface - only essential properties all components need
export interface BaseComponent {
  id: string;
  type: ComponentType;
  label: string;
  fieldId: string;
  required: boolean;
}

// Input-specific interface
export interface InputComponent extends BaseComponent {
  placeholder?: string;
  defaultValue?: string | number | boolean;
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
  multiple?: boolean;
}

// Styled interface - only for components with custom styling
export interface StyledComponent {
  styling: {
    className?: string;
    customCSS?: string;
    width?: string;
    height?: string;
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

// Composite type for full component data - intersection of needed interfaces
export type FormComponentData = BaseComponent & 
  Partial<InputComponent> & 
  Partial<ValidatableComponent> & 
  Partial<OptionsComponent> & 
  Partial<NumericComponent> & 
  Partial<ContainerComponent> & 
  Partial<ConditionalComponent> & 
  Partial<FileComponent> & 
  Partial<StyledComponent> & 
  Partial<PositionedComponent>;

// Specific component type definitions - composition interfaces
// These interfaces combine multiple base interfaces for type safety
 
export interface TextInputComponent extends BaseComponent, InputComponent, ValidatableComponent, ConditionalComponent {}
 
export interface EmailInputComponent extends BaseComponent, InputComponent, ValidatableComponent, ConditionalComponent {}
 
export interface NumberInputComponent extends BaseComponent, NumericComponent, ValidatableComponent, ConditionalComponent {}
 
export interface SelectComponent extends BaseComponent, OptionsComponent, ValidatableComponent, ConditionalComponent {}
 
export interface FileUploadComponent extends BaseComponent, FileComponent, ValidatableComponent, ConditionalComponent {}
 
export interface LayoutComponent extends BaseComponent, ContainerComponent, StyledComponent, PositionedComponent {}