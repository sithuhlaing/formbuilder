// Re-export component types from their proper location
export type {
  ComponentType,
  FormComponentData,
  ValidationRule,
  ValidationType,
  SidebarProps,
} from './components/types/component';

// Re-export strategy types
export type { IDropZoneStrategy } from './components/Canvas/strategies/DropZoneStrategy';

// App-level types
export interface AppState {
  components: FormComponentData[];
  selectedComponentId: string | null;
  isDragging: boolean;
}

export interface FormBuilderConfig {
  maxComponents?: number;
  allowedTypes?: ComponentType[];
  theme?: 'light' | 'dark';
  gridColumns?: number;
}

// Template and Page structure
export interface Page {
  id: string;
  title: string;
  components: FormComponentData[];
}

export interface Template {
  id: string;
  name: string;
  pages: Page[];
  currentView: 'desktop' | 'tablet' | 'mobile';
  fields?: FormComponentData[]; // For migrating legacy templates
}

// Modal and Notification types
export interface ModalFunctions {
  showConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: 'warning' | 'error' | 'info' | 'danger'
  ) => void;
  showNotification: (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) => void;
}

export interface NotificationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: 'info' | 'success' | 'warning' | 'error' | 'danger';
}

// Legacy types for migration - you may want to remove these later
export type FormTemplateType =
  | 'assessment'
  | 'survey'
  | 'application'
  | 'feedback'
  | 'registration'
  | 'other';

export interface FormPage {
  id: string;
  title: string;
  components: FormComponentData[];
  layout: any;
  description?: string;
}

export interface FormTemplate {
  templateId: string;
  name: string;
  type: FormTemplateType;
  fields: FormComponentData[]; // For backward compatibility
  pages: FormPage[];
  createdDate: string;
  modifiedDate: string;
  jsonSchema: any;
}

interface BaseComponent {
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

interface TextInputComponent extends BaseComponent {
  type: 'text_input';
}

interface NumberInputComponent extends BaseComponent {
  type: 'number_input';
  min?: number;
  max?: number;
  step?: number;
}

interface TextareaComponent extends BaseComponent {
  type: 'textarea';
}

interface RichTextComponent extends BaseComponent {
  type: 'rich_text';
  height?: string;
}

interface SelectComponent extends BaseComponent {
  type: 'select';
  options?: string[];
}

interface DatePickerComponent extends BaseComponent {
  type: 'date_picker';
}

interface FileUploadComponent extends BaseComponent {
  type: 'file_upload';
  acceptedFileTypes?: string;
}

interface SectionDividerComponent extends BaseComponent {
  type: 'section_divider';
}

interface SignatureComponent extends BaseComponent {
  type: 'signature';
}

interface HorizontalLayoutComponent extends BaseComponent {
  type: 'horizontal_layout';
  children: FormComponentData[];
}

interface VerticalLayoutComponent extends BaseComponent {
  type: 'vertical_layout';
  children: FormComponentData[];
}

export interface FormComponentData {
  id: string;
  type: string;
  [key: string]: any;
}

type FormComponentData =
  | TextInputComponent
  | NumberInputComponent
  | TextareaComponent
  | RichTextComponent
  | SelectComponent
  | DatePickerComponent
  | FileUploadComponent
  | SectionDividerComponent
  | SignatureComponent
  | HorizontalLayoutComponent
  | VerticalLayoutComponent;

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
  | 'radio_group'
  | 'date_picker'
  | 'file_upload'
  | 'section_divider'
  | 'signature'
  | 'horizontal_layout'
  | 'vertical_layout';

export type {
  ValidationRule,
  ValidationType,
} from './components/types/validation';
