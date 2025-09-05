// Central type exports - main entry point for all types
// SOLID PRINCIPLE REFACTORING - Updated imports

// Re-export component types from segregated interfaces
export type { 
  ComponentType,
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
