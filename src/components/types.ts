export type ComponentType = 
  | "text_input"
  | "textarea" 
  | "select"
  | "checkbox"
  | "radio_group"
  | "date_picker"
  | "file_upload"
  | "number_input"
  | "multi_select"
  | "section_divider"
  | "signature"
  | "horizontal_container"
  | "vertical_container";

export type ValidationType = "none" | "email" | "number" | "custom";

export type LayoutDirection = "horizontal" | "vertical";
export type LayoutAlignment = "start" | "center" | "end" | "stretch";
export type LayoutGap = "none" | "small" | "medium" | "large";

export interface FormComponentData {
  id: string;
  type: ComponentType;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  fieldId?: string;
  helpText?: string;
  acceptedFileTypes?: string;
  validation?: ValidationType;
  customValidation?: string;
  // Number input specific properties
  min?: number;
  max?: number;
  step?: number;
  // Section divider specific properties
  description?: string;
  // Layout properties
  layout?: {
    direction?: LayoutDirection;
    alignment?: LayoutAlignment;
    gap?: LayoutGap;
    width?: string; // e.g., "50%", "200px", "auto"
  };
  // Container properties
  children?: FormComponentData[];
}

export type FormTemplateType = "assessment" | "referral" | "compliance" | "other";

export interface FormPage {
  id: string;
  title: string;
  components: FormComponentData[];
}

export interface FormTemplate {
  templateId: string;
  name: string;
  type: FormTemplateType;
  createdDate: string;
  fields: FormComponentData[];
  pages?: FormPage[];
  jsonSchema?: object;
}

export interface FormBuilderProps {
  onSave: (template: FormTemplate) => void;
  onPreview: (template: FormTemplate) => void;
}

export interface PropertiesProps {
  component: FormComponentData | null;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
}

export interface CanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onAddComponent: (type: ComponentType) => void;
  onInsertWithPosition?: (type: ComponentType, targetId: string, position: 'left' | 'right' | 'top' | 'bottom') => void;
  onInsertBetween?: (type: ComponentType, insertIndex: number) => void;
  onInsertHorizontal?: (type: ComponentType, targetId: string, position: 'left' | 'right') => void;
}

export interface SidebarProps {
  onAddComponent: (type: ComponentType) => void;
}

export interface DraggableComponentProps {
  component: FormComponentData;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onInsertWithPosition?: (type: ComponentType, targetId: string, position: 'left' | 'right' | 'top' | 'bottom') => void;
}
