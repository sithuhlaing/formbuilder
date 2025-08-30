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
  | 'horizontal_layout'
  | 'vertical_layout';

export interface FormComponentData {
  id: string;
  type: ComponentType;
  label: string;
  fieldId: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  acceptedFileTypes?: string;
  description?: string;
  helpText?: string;
  children?: FormComponentData[];
  rows?: number;
  content?: string;
  maxSize?: number;
  height?: string;
  layout?: {
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
  };
}
