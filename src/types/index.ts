// Central type exports - main entry point for all types
// ALIGNED WITH DOCUMENTATION

// Re-export component types - DOCUMENTATION ALIGNED
export type { 
  ComponentType,
  FormComponentData,
  ValidationRule,
  ValidationResult,
  ConditionalRule,
  OptionData
} from './component';

// Re-export form schema types - DOCUMENTATION ALIGNED
export type {
  FormSchema,
  FormPage,
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