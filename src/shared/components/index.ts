/**
 * Shared Components - Clean Export
 */

export { Button } from './Button';
export { Modal } from './Modal';
export { ActionButton } from './ActionButton';
export { ConfirmDialog } from './ConfirmDialog';
export { DragLayer } from './DragLayer';

// Form Components
export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

// Input Components
export { 
  TextInput, 
  NumberInput, 
  Textarea, 
  Select, 
  Checkbox, 
  RadioGroup, 
  FileUpload 
} from './Input';

// Specialized Form Components
export {
  SectionDivider,
  SignatureField,
  ButtonPreview,
  HeadingPreview,
  CardPreview,
  DatePicker,
  UnknownComponent
} from './SpecializedFormComponents';

// Simple Component Renderer - Phase 4 Implementation
export { renderSimpleComponent } from '../../components/SimpleRenderer';

// Legacy components have been removed - using simplified architecture
// Current drag-drop functionality in:
// - SimpleCanvas 
// - SimpleDraggableComponent 
// - SimpleComponentPalette