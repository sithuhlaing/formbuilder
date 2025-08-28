import type { FormComponentData, ComponentType } from './component';

// App-level type definitions
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

// Modal functions interface
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

// State interfaces for modals
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