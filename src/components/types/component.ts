
export type ComponentType = 
  | "text_input"
  | "number_input"
  | "textarea"
  | "rich_text" 
  | "select"
  | "multi_select"
  | "checkbox"
  | "radio_group"
  | "date_picker"
  | "file_upload"
  | "section_divider"
  | "signature"
  | "horizontal_layout"
  | "vertical_layout";

export interface FormComponentData {
  layout: any;
  id: string;
  type: ComponentType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  fieldId?: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  acceptedFileTypes?: string;
  description?: string;
  helpText?: string;
  children?: FormComponentData[];
}
