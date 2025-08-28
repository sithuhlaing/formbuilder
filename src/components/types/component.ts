
export type ComponentType = 
  | 'text_input'
  | 'number_input'
  | 'email_input'
  | 'textarea'
  | 'rich_text'
  | 'select'
  | 'multi_select'
  | 'checkbox'
  | 'radio_group'
  | 'date_picker'
  | 'file_upload'
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
  validation?: ValidationRule;
  layout?: {
    width?: string;
    height?: string;
  };
  children?: FormComponentData[];
  // ... other properties
}

// ... other interfaces
