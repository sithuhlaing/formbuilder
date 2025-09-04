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

// Re-export state management interfaces
export type {
  IFormState,
  IFormAction,
  IFormStateEngine,
  IFormQueries,
  IFormCommands,
  IFormValidator,
  FormPage,
  FormAction
} from '../core/interfaces/StateInterfaces';

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
