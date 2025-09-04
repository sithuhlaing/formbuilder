// Component type definitions - ALIGNED WITH DOCUMENTATION
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
  | "card";

// Option type for select, radio, and checkbox components
export interface OptionData {
  value: string;
  label: string;
}

// ALIGNED WITH DOCUMENTATION - Validation interfaces
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => ValidationResult;
}

export interface ValidationResult {
  isValid: any;
  warnings: string[] | undefined;
  valid: boolean;
  message?: string;
  errors?: string[];
}

// ALIGNED WITH DOCUMENTATION - Conditional logic interfaces
export interface ConditionalRule {
  field: string;                    // Reference field ID
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;                       // Comparison value
}

// ALIGNED WITH DOCUMENTATION - FormComponentData interface
export interface FormComponentData {
  content: string;
  description(arg0: string, description: any, arg2: string): import("react").ReactNode;
  alignment: string;
  // Core properties - REQUIRED
  id: string;
  type: ComponentType;
  fieldId: string;                    // Unique field identifier for data mapping
  label: string;
  required: boolean;
  helpText?: string;
  
  // Optional core properties
  placeholder?: string;
  defaultValue?: string | number | boolean;
  
  // Validation properties
  validationRules?: ValidationRule[];
  
  // Component-specific properties
  options?: Array<{label: string; value: string}>;  // For select, radio, checkbox
  minLength?: number;                 // For text inputs
  maxLength?: number;                 // For text inputs
  pattern?: string;                   // Regex validation
  min?: number;                       // For number inputs
  max?: number;                       // For number inputs
  step?: number;                      // For number inputs
  acceptedFileTypes?: string;         // For file uploads
  multiple?: boolean;                 // For file uploads and multi-select
  rows?: number;                      // For textarea
  height?: string;                    // For rich text and others
  width?: string;                     // CSS width
  
  // Layout properties
  children?: FormComponentData[];     // For layout containers
  
  // Conditional display
  conditionalDisplay?: {
    showWhen?: ConditionalRule;
    hideWhen?: ConditionalRule;
  };
  
  // Position and styling
  position?: {
    x: number;
    y: number;
    row?: number;
    column?: number;
  };
  
  styling?: {
    className?: string;
    customCSS?: string;
    theme?: string;
  };
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