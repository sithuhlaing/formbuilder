// Main Canvas component with SOLID principles applied
export { default } from '../CanvasSolid';

// Types and interfaces for external use
export type { CanvasActions, DragItem, DropPosition, IDragDropHandler, IDropZone } from './types';

// Strategies for extending behavior (Open/Closed Principle)
export { BetweenComponentsDropStrategy, CanvasMainDropStrategy } from './strategies/DropZoneStrategy';
export type { IDropZoneStrategy } from './strategies/DropZoneStrategy';

// Handlers for business logic (Single Responsibility Principle)
export { CanvasDragDropHandler } from './handlers/CanvasDragDropHandler';
export { ComponentDragDropHandler } from './handlers/ComponentDragDropHandler';

// Components for UI concerns (Single Responsibility Principle)
export { default as CanvasDropZone } from './components/CanvasDropZone';
export { default as ComponentDropIndicator } from './components/ComponentDropIndicator';
export { default as DraggableCanvasItem } from './components/DraggableCanvasItem';
export { default as CanvasEmptyState } from './components/CanvasEmptyState';

// Abstractions for dependency inversion (Dependency Inversion Principle)
export { ReactDndProvider } from './abstractions/DragDropAbstraction';
export type { IDragDropProvider, DropZoneConfig, DragSourceConfig } from './abstractions/DragDropAbstraction';