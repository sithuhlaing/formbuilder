export type ComponentKind =
  | 'text_input'
  | 'email_input'
  | 'password_input'
  | 'number_input'
  | 'textarea'
  | 'rich_text'
  | 'select'
  | 'multi_select'
  | 'checkbox'
  | 'radio_group'
  | 'date_picker'
  | 'file_upload'
  | 'signature'
  | 'section_divider'
  | 'button'
  | 'heading'
  | 'card'
  | 'patient_id'
  | 'medical_record_number'
  | 'insurance_member_number'
  | 'nhs_number';

export interface ComponentValidationRule {
  type: 'required' | 'pattern' | 'min' | 'max' | 'minLength' | 'maxLength' | 'fileType';
  value?: string | number;
  message?: string;
}

export interface FormComponent {
  nodeId: string;
  type: ComponentKind;
  label: string;
  fieldId: string;
  required: boolean;
  validation: ComponentValidationRule[];
  properties: Record<string, unknown>;
}

export interface RowContainer {
  nodeId: string;
  type: 'row';
  children: Array<FormNode>;
}

export type FormNode = FormComponent | RowContainer;

export const isRowContainer = (node: FormNode): node is RowContainer => node.type === 'row';
