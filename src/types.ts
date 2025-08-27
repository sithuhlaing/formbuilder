// Re-export component types from their proper location
export type { IDropZoneStrategy } from './components/Canvas/strategies/DropZoneStrategy';
export type { ComponentType, FormComponentData } from './components/types/component';

// Additional app-level types
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

// Template and template types (enhanced)
export type FormTemplateType = "assessment" | "survey" | "application" | "feedback" | "registration" | "other";

export interface FormPage {
  layout: any;
  id: string;
  title: string;
  components: FormComponentData[];
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

// Modal functions interface
export interface ModalFunctions {
  showConfirmation: (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    type?: 'warning' | 'error' | 'info'
  ) => void;
  showNotification: (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info'
  ) => void;
}