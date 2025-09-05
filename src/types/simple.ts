/**
 * SIMPLIFIED TYPES - Replacing complex interface hierarchy
 * Goal: Single, simple interface instead of 15+ intersected interfaces
 */

// Simple component types - no over-engineering
export type ComponentType = 
  // Input Components
  | 'text_input' 
  | 'email_input' 
  | 'number_input' 
  | 'textarea'
  
  // Selection Components  
  | 'select' 
  | 'radio_group' 
  | 'checkbox'
  
  // Special Components
  | 'date_picker' 
  | 'file_upload'
  
  // Layout Components
  | 'horizontal_layout' 
  | 'vertical_layout'
  
  // UI Components
  | 'button' 
  | 'heading' 
  | 'paragraph';

// Single, unified component interface - replacing complex hierarchy
export interface Component {
  // Essential properties
  id: string;
  type: ComponentType;
  label: string;
  required?: boolean;
  
  // Input-specific properties
  placeholder?: string;
  defaultValue?: string | number | boolean;
  
  // Selection components (select, radio, checkbox)
  options?: Array<{
    label: string; 
    value: string;
  }>;
  
  // Layout components (horizontal_layout, vertical_layout)
  children?: Component[];
  
  // Simple validation (replacing complex ValidationEngine)
  validation?: {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    message?: string;
  };
  
  // Simple styling (replacing complex ComponentLayout)
  style?: React.CSSProperties;
  className?: string;
  
  // Component-specific properties
  // For textarea
  rows?: number;
  
  // For file upload
  accept?: string;
  multiple?: boolean;
  
  // For heading
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  
  // For button
  variant?: 'primary' | 'secondary' | 'danger';
}

// Simplified form state - replacing complex FormStateEngine
export interface FormState {
  // Core state
  components: Component[];
  selectedId: string | null;
  templateName: string;
  
  // Simple history - replacing complex HistoryManager
  history: FormState[];
  historyIndex: number;
  
  // UI state
  previewMode?: boolean;
}

// Simple form actions - replacing complex action dispatching
export interface FormActions {
  // Component operations
  addComponent: (type: ComponentType, index?: number) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  
  // List operations
  moveComponent: (fromIndex: number, toIndex: number) => void;
  
  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Form operations
  setTemplateName: (name: string) => void;
  clearAll: () => void;
  togglePreview: () => void;
  
  // Import/Export
  exportJSON: () => string;
  importJSON: (jsonString: string) => void;
}

// Drop position for drag-drop - simplified
export interface DropPosition {
  index: number;
  parentId?: string;
}

// Drag item interface
export interface DragItem {
  type: ComponentType;
  id?: string; // for existing components
}

// Default values helper
export const DEFAULT_LABELS: Record<ComponentType, string> = {
  text_input: 'Text Input',
  email_input: 'Email Address',
  number_input: 'Number',
  textarea: 'Text Area',
  select: 'Select',
  radio_group: 'Radio Group',
  checkbox: 'Checkbox',
  date_picker: 'Date',
  file_upload: 'File Upload',
  horizontal_layout: 'Horizontal Layout',
  vertical_layout: 'Vertical Layout',
  button: 'Button',
  heading: 'Heading',
  paragraph: 'Paragraph'
};

// Utility function to generate IDs
export function generateId(prefix: string = 'comp'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}