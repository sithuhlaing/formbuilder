/**
 * Shared Components - Clean Export
 */

export { Button } from './Button';
export { Modal } from './Modal';
export { ActionButton } from './ActionButton';
export { ConfirmDialog } from './ConfirmDialog';

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

// Legacy Drag-Drop Components - Moved to legacy in Phases 3 & 4
// If you need drag-drop functionality, use the new simple components:
// - SimpleCanvas (Phase 3)
// - SimpleDraggableComponent (Phase 3) 
// - SimpleComponentPalette (Phase 3)
// 
// Original complex components preserved in:
// - src/_legacy_phase3/drag-drop-system/
// - src/_legacy_phase3/canvas-system/