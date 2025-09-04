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

// Component Renderer
export { ComponentRenderer } from '../../core/ComponentRenderer';

// Drop Zone Components - Legacy Pattern
// NOTE: These use legacy callback patterns for backward compatibility
// For NPM package usage, see: src/packages/react-drag-canvas/components/
export { 
  DropZone, 
  BetweenDropZone,      // Legacy: onInsertBetween(ComponentType, index)
  SmartDropZone,        // Legacy: basic position detection
  CanvasDropZone 
} from './DropZone';

// Drag Handle Components
export { 
  DragHandle, 
  DeleteButton, 
  DragControls, 
  RowLayoutControls 
} from './DragHandle';