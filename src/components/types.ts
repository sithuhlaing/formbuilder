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

export type ValidationType = "none" | "email" | "number" | "custom";

export type FormTemplateType = "assessment" | "survey" | "application" | "feedback" | "registration" | "other";

export interface ValidationRule {
  type: ValidationType;
  message?: string;
  pattern?: string;
  min?: number;
  max?: number;
  required?: boolean;
}

export interface LayoutConfig {
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface FormComponentData {
  id: string;
  type: ComponentType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: ValidationRule;
  layout?: {
    width?: string;
    height?: string;
    direction?: "horizontal" | "vertical";
    alignment?: "start" | "center" | "end";
    gap?: "small" | "medium" | "large";
  };
  children?: FormComponentData[];
  description?: string;
  acceptedFileTypes?: string;
  fieldId?: string;
  helpText?: string;
  customValidation?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string;
}

export interface FormPage {
  id: string;
  title: string;
  components: FormComponentData[];
  description?: string;
}

export interface FormTemplate {
  templateId: string;
  name: string;
  type: FormTemplateType;
  createdDate: string;
  fields: FormComponentData[];
  pages?: FormPage[];
  jsonSchema?: any;
  description?: string;
}

export interface ComponentGroup {
  id: string;
  components: FormComponentData[];
  layout: 'horizontal' | 'vertical';
}

export interface CanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onAddComponent: (type: ComponentType) => void;
  onInsertWithPosition?: (type: ComponentType, targetId: string, position: 'left' | 'right' | 'top' | 'bottom') => void;
  onInsertBetween?: (type: ComponentType, index: number) => void;
  onInsertHorizontal?: (type: ComponentType, targetId: string, position: 'left' | 'right') => void;
  onDropInContainer?: (item: any, containerId: string) => void;
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

export interface LayoutContainerProps {
  container: FormComponentData;
  onDrop: (item: any, containerId: string) => void;
  renderComponent: (component: FormComponentData, index: number) => React.ReactNode;
}

export interface PropertiesProps {
  component: FormComponentData | null;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
}

export type DropPosition = 'left' | 'right' | 'top' | 'bottom' | null;

export interface SmartDropZoneProps {
  componentId: string;
  onDropWithPosition: (type: ComponentType, targetId: string, position: DropPosition) => void;
  children: React.ReactNode;
  isInHorizontalContainer?: boolean;
  horizontalContainerCount?: number;
}
