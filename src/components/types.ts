
import type { ComponentType } from "../types";

export type ComponentType = 
  | 'text_input'
  | 'number_input'
  | 'email_input'
  | 'password_input'
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

export type ValidationType = "none" | "email" | "number" | "custom";

export interface ValidationRule {
  type: ValidationType;
  message?: string;
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  customValidator?: (value: any) => boolean | string;
}

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
}

export interface SidebarProps {
  onAddComponent: (type: ComponentType) => void;
}
