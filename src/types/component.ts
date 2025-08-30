// Component type definitions
export type ComponentType = 
  | "text_input"
  | "email_input"
  | "password_input"
  | "number_input"
  | "textarea"
  | "rich_text" 
  | "select"
  | "multi_select"
  | "checkbox"
  | "checkbox_group"
  | "radio_group"
  | "date_picker"
  | "file_upload"
  | "heading"
  | "paragraph"
  | "divider"
  | "section_divider"
  | "signature"
  | "button"
  | "card"
  | "horizontal_layout"
  | "vertical_layout";

// Option type for select, radio, and checkbox components
export interface OptionData {
  value: string;
  label: string;
}

export interface FormComponentData {
  layout?: any; // Keep as any for backwards compatibility
  id: string;
  type: ComponentType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  fieldId?: string;
  defaultValue?: string | number | boolean; // Default value for form components
  options?: (string | OptionData)[];
  min?: number;
  max?: number;
  step?: number;
  acceptedFileTypes?: string;
  multiple?: boolean; // For file upload components
  description?: string;
  helpText?: string;
  children?: FormComponentData[];
  rows?: number;
  content?: string;
  maxSize?: number;
  height?: string;
  width?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  // Button component properties
  buttonType?: 'primary' | 'secondary' | 'success' | 'danger';
  buttonText?: string;
  // Heading component properties
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  text?: string;
}

// Specific component interfaces for type safety
export interface BaseComponent {
  id: string;
  type: string;
  label: string;
  fieldId?: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  children?: FormComponentData[];
  layout?: 'horizontal' | 'vertical';
  container?: boolean;
  path?: string[];
}

export interface TextInputComponent extends BaseComponent {
  type: 'text_input';
}

export interface NumberInputComponent extends BaseComponent {
  type: 'number_input';
  min?: number;
  max?: number;
  step?: number;
}

export interface TextareaComponent extends BaseComponent {
  type: 'textarea';
}

export interface RichTextComponent extends BaseComponent {
  type: 'rich_text';
  height?: string;
}

export interface SelectComponent extends BaseComponent {
  type: 'select';
  options?: (string | OptionData)[];
}

export interface DatePickerComponent extends BaseComponent {
  type: 'date_picker';
}

export interface FileUploadComponent extends BaseComponent {
  type: 'file_upload';
  acceptedFileTypes?: string;
  multiple?: boolean;
}

export interface SectionDividerComponent extends BaseComponent {
  type: 'section_divider';
}

export interface SignatureComponent extends BaseComponent {
  type: 'signature';
}

export interface HorizontalLayoutComponent extends BaseComponent {
  type: 'horizontal_layout';
  children: FormComponentData[];
}

export interface VerticalLayoutComponent extends BaseComponent {
  type: 'vertical_layout';
  children: FormComponentData[];
}

export interface ButtonComponent extends BaseComponent {
  type: 'button';
  buttonType?: 'primary' | 'secondary' | 'success' | 'danger';
  buttonText?: string;
}

export interface HeadingComponent extends BaseComponent {
  type: 'heading';
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  text?: string;
}

export interface CardComponent extends BaseComponent {
  type: 'card';
  children: FormComponentData[];
}