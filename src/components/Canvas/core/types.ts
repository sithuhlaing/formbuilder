/**
 * Canvas and Drag-Drop Type Definitions
 */

export type Intent = 'BEFORE' | 'AFTER' | 'LEFT' | 'RIGHT' | 'APPEND_TO_CANVAS_END';

export interface CanvasNode {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: CanvasNode[];
}

export interface CanvasState {
  nodes: CanvasNode[];
}

export interface DropZoneCalculator {
  calculateIntent(
    clientOffset: { x: number; y: number },
    targetRect: DOMRect,
    isEmptyCanvasGap: boolean
  ): Intent;
}