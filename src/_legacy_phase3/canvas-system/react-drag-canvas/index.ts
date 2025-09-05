/**
 * react-drag-canvas - Generic Drag & Drop Canvas Package
 * Reusable canvas that works with any item types
 */

// Main exports for react-drag-canvas package
export { DragDropCanvas } from './components/DragDropCanvas';
export { SmartDropZone } from './components/SmartDropZone';
// export { HorizontalLayout } from './components/HorizontalLayout';
export { RowLayout } from './components/RowLayout';
export { VerticalLayout } from './components/VerticalLayout';
export { PWADragDropCanvas } from './components/PWAOptimizedCanvas';
export { CSPSafeComponentRenderer, PWAFormCanvasAdapter } from './components/CSPSafeComponentRenderer';
export { FormCanvas } from './FormCanvasAdapter';

// PWA-specific exports
export { useOfflineFormPersistence } from './hooks/useOfflineFormPersistence';

// SOLID: Abstraction layer exports
export {
  AbstractCanvasRenderer,
  HTMLStringRenderer,
  CSPSafeRenderer,
  FunctionRenderer,
  CanvasRendererFactory,
  createRenderItemFunction
} from './abstractions/CanvasRenderer';
export type { RendererType, RendererConfig } from './abstractions/CanvasRenderer';

// Types
export type {
  CanvasItem,
  CanvasConfig,
  DragDropCanvasProps,
  DragItem,
  DropPosition,
  RenderContext,
  CanvasRenderer,
  // SOLID: Segregated interfaces
  CanvasCore,
  CanvasDragDrop,
  CanvasUI,
  SmartDropZoneProps
} from './types';
