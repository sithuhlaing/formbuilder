
// Re-export all component types for easier imports
export * from './components/types';

// Additional app-level types can be added here
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

// Import the main types we're re-exporting
import type { FormComponentData, ComponentType } from './components/types';
