/**
 * Modular Canvas System - Entry Point
 * Exports all the new simplified and modular components
 */

// Core logic
export { SimpleDragDropRules } from './core/DragDropRules';
export { CanvasStateManager } from './core/CanvasStateManager';
export type { Intent, CanvasNode, CanvasState } from './core/types';

// Components
export { default as SimplifiedCanvas } from './components/SimplifiedCanvas';
export { default as SimplifiedDropZone } from './components/SimplifiedDropZone';
export { default as SimplifiedRowLayout } from './components/SimplifiedRowLayout';
export { default as AutoSizingCanvas } from './components/AutoSizingCanvas';
export { default as AutoSizingRowLayout } from './components/AutoSizingRowLayout';
export { default as ResponsiveCanvasWrapper } from './components/ResponsiveCanvasWrapper';

// Hooks
export { useSimplifiedCanvas } from '../../hooks/useSimplifiedCanvas';
export { useAutoSizingCanvas } from '../../hooks/useAutoSizingCanvas';
