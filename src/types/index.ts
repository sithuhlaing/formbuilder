// Central type exports - main entry point for all types

// Re-export component types
export type ComponentType = 
  | 'text_input'
  | 'email_input' 
  | 'password_input'
  | 'number_input'
  | 'textarea'
  | 'rich_text'
  | 'select'
  | 'multi_select'
  | 'checkbox'
  | 'checkbox_group'
  | 'radio_group'
  | 'date_picker'
  | 'file_upload'
  | 'heading'
  | 'paragraph'
  | 'divider'
  | 'section_divider'
  | 'signature'
  | 'button'
  | 'card'
  | 'horizontal_layout'
  | 'vertical_layout';

export type { FormComponentData } from './component';

// Re-export template types  
export type { Template, Page, FormPage, FormTemplate, FormTemplateType } from './template';

// Re-export app types
export type { AppState, FormBuilderConfig, ModalFunctions } from './app';