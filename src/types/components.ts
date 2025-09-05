/**
 * UNIFIED COMPONENT TYPES - Phase 2 Implementation
 * Replaces: Complex interface hierarchy in core/interfaces/ComponentInterfaces.ts
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
  | 'paragraph'
  | 'divider'
  | 'section_divider';

// Single, unified component interface - replacing complex hierarchy
export interface Component {
  // === Core Properties ===
  id: string;
  type: ComponentType;
  label: string;
  required?: boolean;
  
  // === Input Properties ===
  placeholder?: string;
  defaultValue?: string | number | boolean | string[];
  readOnly?: boolean;
  disabled?: boolean;
  
  // === Selection Components (select, radio, checkbox) ===
  options?: Array<{
    label: string; 
    value: string;
  }>;
  
  // === Layout Components (horizontal_layout, vertical_layout) ===
  children?: Component[];
  
  // === Simple Validation (replacing complex ValidationEngine) ===
  validation?: {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    message?: string;
  };
  
  // === Simple Styling (replacing complex ComponentLayout) ===
  style?: React.CSSProperties;
  className?: string;
  
  // === Type-Specific Properties ===
  
  // For textarea
  rows?: number;
  cols?: number;
  
  // For file upload
  accept?: string;
  multiple?: boolean;
  
  // For heading
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  
  // For button
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  
  // For number input
  step?: number;
  
  // For paragraph/text content
  content?: string;
  
  // === Meta Properties ===
  helpText?: string;
  fieldId?: string; // For form field identification
}

// Helper type for form field validation result
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  errors?: string[];
}

// Form data structure - simple and clean
export interface FormData {
  templateName: string;
  components: Component[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    version?: string;
    author?: string;
  };
}

// Drop position for drag-drop operations
export interface DropPosition {
  index: number;
  parentId?: string;
  position?: 'before' | 'after' | 'inside';
}

// Drag item interface for React DnD
export interface DragItem {
  type: ComponentType;
  id?: string; // for existing components being moved
  component?: Component; // for palette items
}

// Export/Import formats
export interface FormTemplate {
  templateName: string;
  pages?: Array<{
    title: string;
    components: Component[];
  }>;
  components: Component[]; // Backward compatibility
  version: string;
}

// Default labels for component types
export const DEFAULT_COMPONENT_LABELS: Record<ComponentType, string> = {
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
  paragraph: 'Paragraph',
  divider: 'Divider',
  section_divider: 'Section Divider'
};

// Default placeholders for input types
export const DEFAULT_PLACEHOLDERS: Partial<Record<ComponentType, string>> = {
  text_input: 'Enter text here...',
  email_input: 'Enter email address...',
  number_input: 'Enter number...',
  textarea: 'Enter text here...',
  date_picker: 'Select date...'
};

// Component type categories for UI organization
export const COMPONENT_CATEGORIES = {
  INPUT: ['text_input', 'email_input', 'number_input', 'textarea', 'date_picker', 'file_upload'] as ComponentType[],
  SELECTION: ['select', 'radio_group', 'checkbox'] as ComponentType[],
  LAYOUT: ['horizontal_layout', 'vertical_layout'] as ComponentType[],
  CONTENT: ['heading', 'paragraph', 'button', 'divider', 'section_divider'] as ComponentType[]
};

// Utility function to generate unique IDs
export function generateComponentId(prefix: string = 'comp'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to check if component can have children
export function canHaveChildren(componentType: ComponentType): boolean {
  return COMPONENT_CATEGORIES.LAYOUT.includes(componentType);
}

// Utility function to check if component is a form field
export function isFormField(componentType: ComponentType): boolean {
  return [...COMPONENT_CATEGORIES.INPUT, ...COMPONENT_CATEGORIES.SELECTION].includes(componentType);
}

// Utility function to get component category
export function getComponentCategory(componentType: ComponentType): string {
  for (const [category, types] of Object.entries(COMPONENT_CATEGORIES)) {
    if (types.includes(componentType)) {
      return category;
    }
  }
  return 'UNKNOWN';
}

// Type guards for better type safety
export function isInputComponent(component: Component): boolean {
  return COMPONENT_CATEGORIES.INPUT.includes(component.type);
}

export function isSelectionComponent(component: Component): boolean {
  return COMPONENT_CATEGORIES.SELECTION.includes(component.type);
}

export function isLayoutComponent(component: Component): boolean {
  return COMPONENT_CATEGORIES.LAYOUT.includes(component.type);
}

export function isContentComponent(component: Component): boolean {
  return COMPONENT_CATEGORIES.CONTENT.includes(component.type);
}