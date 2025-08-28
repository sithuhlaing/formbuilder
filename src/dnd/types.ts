/**
 * Drag and Drop Types for Form Builder
 */

// Component drag type constant
export const COMPONENT_TYPE = 'component';

// Drop intent types
export type DropIntent = 
  | 'INSERT_BEFORE'
  | 'INSERT_AFTER'
  | 'INSERT_HORIZONTAL_LEFT'
  | 'INSERT_HORIZONTAL_RIGHT'
  | 'INSERT_INTO_CONTAINER'
  | 'REORDER'
  | 'INVALID';

// Drag item interface
export interface DragItem {
  type: string;
  id?: string;
  componentType?: string;
  index?: number;
  source: 'palette' | 'canvas';
}

// Drop result interface
export interface DropResult {
  intent: DropIntent;
  targetId?: string;
  targetIndex?: number;
  position?: 'before' | 'after' | 'left' | 'right' | 'inside';
}

// Monitor interface for drag-drop operations
export interface DragDropMonitor {
  isOver: boolean;
  canDrop: boolean;
  dropIntent: DropIntent;
  dragItem: DragItem | null;
}