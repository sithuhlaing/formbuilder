/**
 * ALIGNED WITH DOCUMENTATION - Centralized Type Definitions
 * Exports all types used throughout the application
 */

// Core component types
export interface FormComponent {
  id: string;
  type: ComponentType;
  label: string;
  required: boolean;
  validation: ValidationRules;
  styling: ComponentStyling;
  position: Position;
  size: Size;
  options?: SelectOption[];
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  conditionalLogic?: ConditionalLogicConfig;
}

// Re-export ComponentType from components.ts to avoid duplication
export type { ComponentType } from './components';

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  customValidation?: string;
}

export interface ComponentStyling {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: string;
  padding?: number;
  margin?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

// Form structure types
export interface FormPage {
  id: string;
  title: string;
  description?: string;
  components: FormComponent[];
  conditionalLogic?: ConditionalLogicConfig;
}

export interface FormDefinition {
  id: string;
  title: string;
  description?: string;
  pages: FormPage[];
  settings: FormSettings;
  analytics?: FormAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSettings {
  allowSaveProgress: boolean;
  showProgressBar: boolean;
  requireAuthentication: boolean;
  submitButtonText: string;
  successMessage: string;
  redirectUrl?: string;
}

// Re-export component types from segregated interfaces
export type { 
  ValidationRule,
  ValidationResult,
  ConditionalRule,
  OptionData
} from './component';

// Re-export segregated component interfaces
export type {
  FormComponentData,
  BaseComponent,
  InputComponent,
  ValidatableComponent,
  OptionsComponent,
  NumericComponent,
  ContainerComponent,
  ConditionalComponent,
  FileComponent,
  StyledComponent,
  PositionedComponent
} from '../core/interfaces/ComponentInterfaces';

// Note: Complex state management interfaces moved to legacy in Phase 5
// The app now uses simple React state via useSimpleFormBuilder hook

// Re-export form schema types - DOCUMENTATION ALIGNED
export type {
  FormSchema,
  FormSettings,
  FormTheme,
  PageNavigationSettings,
  IndividualSubmissionJSON,
  SurveyDataCollectionJSON,
  SurveyResponse,
  FieldResponse,
  SurveyStatistics,
  FieldStatistics
} from './form-schema';

// Re-export template types  
export type { Template, FormTemplate, FormTemplateType } from './template';

// Re-export app types
export type { AppState, FormBuilderConfig, ModalFunctions } from './app';

// Re-export from other type files
export * from './form-schema';
export * from './conditional-rules';
export * from './drag-drop';
export * from './template';
