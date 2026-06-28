/**
 * PHASE 3: Core Layout Engine Implementation
 * Implements the complete drag-drop layout system according to PRD requirements
 */

import type { Component, ComponentType } from '../types/components';

// Core Enums
export enum DropPosition {
  BEFORE = 'before',
  AFTER = 'after',
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center',
  INSIDE = 'inside'
}

export enum DragType {
  NEW_ITEM = 'new-item',
  EXISTING_ITEM = 'existing-item'
}

// Core Interfaces
export interface DragData {
  dragType: DragType;
  sourceId?: string;
  componentType: ComponentType;
  item: Component | null;
  isRowLayout?: boolean;
}

export interface DropZoneConfig {
  horizontalEdge: number;
  verticalEdge: number;
  centerBlocked: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  componentId?: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  code: string;
  message: string;
  componentId?: string;
}

export interface ComponentContext {
  targetIndex: number;
  isInRow: boolean;
  rowLayout?: Component;
  parentComponents: Component[];
}

export interface DissolutionContext {
  rowLayout: Component;
  parentComponents: Component[];
  trigger: 'delete' | 'move_out' | 'manual';
}

export interface HorizontalLayoutCreationContext {
  dragData: DragData;
  targetComponent: Component;
  dropPosition: DropPosition.LEFT | DropPosition.RIGHT;
  parentComponents: Component[];
}

export function calculateDropPosition(
  boundingBox: { width: number; height: number; left?: number; top?: number },
  cursor: { x: number; y: number },
  isTopLevel: boolean,
  targetIndex: number
) {
  if (!isTopLevel) {
    // RULE B: We are inside a row. If the cursor is at the outer right edge, we treat it as dropping outside (vertical).
    if (cursor.x >= boundingBox.width * 0.75) {
      return {
        type: 'BETWEEN',
        index: targetIndex + 1
      };
    }
    // Otherwise, calculate left/right reordering based on a 50% midpoint.
    const isLeftHalf = cursor.x < (boundingBox.width / 2);
    return {
      type: 'COLUMN_BETWEEN',
      direction: isLeftHalf ? 'left' : 'right',
      targetColumnIndex: targetIndex
    };
  } else {
    // RULE A: We are on the main canvas. Check the 30% thresholds for row creation.
    if (cursor.x < boundingBox.width * 0.30) {
      return {
        type: 'SIDE',
        position: 'left',
        targetIndex
      };
    }
    if (cursor.x > boundingBox.width * 0.70) {
      return {
        type: 'SIDE',
        position: 'right',
        targetIndex
      };
    }

    // Vertical Y-axis fallback for main canvas
    const isTopHalf = cursor.y < (boundingBox.height / 2);
    return {
      type: 'BETWEEN',
      index: isTopHalf ? targetIndex : targetIndex + 1
    };
  }
}

export function executeLayoutCleanup(components: Component[]): Component[] {
  return components.flatMap(comp => {
    if (comp.type === 'horizontal_layout') {
      const activeColumns = comp.columns || [];
      const totalFields = activeColumns.reduce((sum: number, col: any) => sum + (col.fields?.length || 0), 0);

      // If the row layout container has 1 or fewer items, dissolve it
      if (totalFields <= 1) {
        const survivingField = activeColumns.find((col: any) => col.fields?.length === 1)?.fields?.[0];
        return survivingField ? [survivingField] : [];
      }

      return [comp];
    }
    return [comp];
  });
}

export function executeLayoutMutation(
  activeCanvas: any,
  draggedComponent: any,
  dropCommand: any
): any {
  if (dropCommand.type === 'INVALID_DROP_ZONE') {
    return activeCanvas;
  }

  // Handle reordering in main V-layout
  if (dropCommand.type === 'BETWEEN') {
    const list = Array.isArray(activeCanvas) ? [...activeCanvas] : [];
    const fromIndex = list.findIndex(c => c.id === draggedComponent.id);
    if (fromIndex === -1) {
      // Splicing a new component
      list.splice(dropCommand.index, 0, draggedComponent);
      return list;
    }

    // Reordering existing components
    const [removed] = list.splice(fromIndex, 1);
    const targetIndex = fromIndex < dropCommand.index ? dropCommand.index - 1 : dropCommand.index;
    list.splice(targetIndex, 0, removed);
    return list;
  }

  // Handle row creation (SIDE drop)
  if (dropCommand.type === 'SIDE') {
    const list = Array.isArray(activeCanvas) ? [...activeCanvas] : [];
    const targetComponent = list[dropCommand.targetIndex];
    if (!targetComponent) return activeCanvas;

    const rowLayout: Component = {
      id: `row_${Date.now()}`,
      type: 'horizontal_layout',
      isLayout: true,
      columns: [
        { id: `col_left_${Date.now()}`, fields: dropCommand.position === 'left' ? [draggedComponent] : [targetComponent] },
        { id: `col_right_${Date.now()}`, fields: dropCommand.position === 'left' ? [targetComponent] : [draggedComponent] }
      ]
    };

    list[dropCommand.targetIndex] = rowLayout;
    return list;
  }

  // Handle reordering nested columns inside a row
  if (dropCommand.type === 'COLUMN_BETWEEN') {
    const activeRow = activeCanvas;
    const targetColumnIndex = dropCommand.targetColumnIndex;

    const currentIndex = activeRow.columns.findIndex((col: any) => 
      col.fields?.some((f: any) => f.id === draggedComponent.id)
    );

    if (currentIndex === -1) {
      return activeRow;
    }

    const newColumns = activeRow.columns.map((col: any) => ({
      ...col,
      fields: [...(col.fields || [])]
    }));

    const draggedField = newColumns[currentIndex].fields.find((f: any) => f.id === draggedComponent.id);

    newColumns[currentIndex].fields = newColumns[currentIndex].fields.filter((f: any) => f.id !== draggedComponent.id);

    const temp = newColumns[targetColumnIndex].fields;
    newColumns[targetColumnIndex].fields = [draggedField];
    newColumns[currentIndex].fields = temp;

    return {
      ...activeRow,
      columns: newColumns
    };
  }

  return activeCanvas;
}
