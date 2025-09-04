// Single source of truth for component types
// Re-export from core interfaces to maintain backward compatibility

export type { 
  ComponentType,
  FormComponentData,
  BaseComponent,
  InputComponent,
  ValidatableComponent,
  OptionsComponent,
  NumericComponent,
  ContainerComponent,
  ConditionalComponent,
  FileComponent,
  StyledComponent,
  PositionedComponent
} from '../core/interfaces/ComponentInterfaces';

// Validation types
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom' | 'signature' | 'number' | 'date' | 'file';
  value?: any;
  message: string;
  validator?: (value: any) => ValidationResult;
}

export interface ValidationResult {
  isValid: any;
  warnings: string[] | undefined;
  valid: boolean;
  message?: string;
  errors?: string[];
}

// Conditional logic types
export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

// Option type for select, radio, and checkbox components
export interface OptionData {
  value: string;
  label: string;
}

// Drop position types
export type DropPosition = 'before' | 'after' | 'left' | 'right' | 'inside' | 'center';
