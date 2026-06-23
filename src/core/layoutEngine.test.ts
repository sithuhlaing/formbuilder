import { describe, it, expect } from 'vitest';
import { calculateDropPosition, executeLayoutCleanup, executeLayoutMutation } from './layoutEngine';
import { Component } from '../types/components';

describe('Layout Engine - Strict Coordinate Precedence', () => {
  const boundingBox = { top: 0, bottom: 100, left: 0, right: 100, height: 100, width: 100 };

  it('enforces horizontal X-axis precedence over vertical Y-axis in corner coordinates', () => {
    // Cursor at top-left: x=10 (left 10%), y=10 (top 10%)
    const cursor = { x: 10, y: 10 }; 
    const isTopLevel = true;
    
    const result = calculateDropPosition(boundingBox, cursor, isTopLevel, 0);
    
    // Must return SIDE and ignore the top 10% Y-axis trigger
    expect(result.type).toBe('SIDE');
    expect(result.position).toBe('left');
  });

  it('executes vertical midpoint splicing when X-axis thresholds fail', () => {
    // Cursor at center-bottom: x=50 (center), y=80 (bottom 80%)
    const cursor = { x: 50, y: 80 }; 
    const isTopLevel = true;
    const targetIndex = 2;
    
    const result = calculateDropPosition(boundingBox, cursor, isTopLevel, targetIndex);
    
    expect(result.type).toBe('BETWEEN');
    expect(result.index).toBe(targetIndex + 1);
  });
});

describe('Layout Engine - Structural Integrity Guards', () => {
  
  it('enforces Top-Level Lockout to prevent nested row generation', () => {
    const boundingBox = { top: 0, bottom: 100, left: 0, right: 100, height: 100, width: 100 };
    // Cursor deep in the right drop zone (x=90)
    const cursor = { x: 90, y: 50 }; 
    // Target is nested inside an existing row
    const isTopLevel = false; 
    
    const result = calculateDropPosition(boundingBox, cursor, isTopLevel, 0);
    
    // Must ignore X-axis boundary and default to vertical list insertion
    expect(result.type).not.toBe('SIDE');
    expect(result.type).toBe('BETWEEN');
  });

  it('dissolves row containers synchronously when child count reaches 1', () => {
    const mockState = [
      {
        id: 'row_1',
        type: 'horizontal_layout',
        isLayout: true,
        columns: [
          { id: 'col_1', fields: [{ id: 'surviving_field', type: 'text_input', label: 'Text' }] },
          { id: 'col_2', fields: [] } // Extracted node
        ]
      }
    ];

    const result = executeLayoutCleanup(mockState);
    
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('surviving_field');
    expect(result[0].type).toBe('text_input');
    expect(result.find(c => c.id === 'row_1')).toBeUndefined();
  });
});

describe('Layout Engine - Nested Row Reordering (Rule B)', () => {

  it('[3.1] evaluates horizontal midpoint for REORDERING when inside a row (isTopLevel = false)', () => {
    const boundingBox = { top: 0, bottom: 100, left: 0, right: 100, height: 100, width: 100 };
    // Cursor is on the left half of the target component (x = 25)
    const cursorPosition = { x: 25, y: 50 }; 
    
    // Explicitly declaring this component is nested inside a row
    const isTopLevel = false; 
    const targetColumnIndex = 1; 
    
    const dropPosition = calculateDropPosition(boundingBox, cursorPosition, isTopLevel, targetColumnIndex);
    
    // Engine must NOT return 'SIDE' (which creates rows)
    expect(dropPosition.type).not.toBe('SIDE');
    // Engine MUST return a column reorder command targeting the left side
    expect(dropPosition.type).toBe('COLUMN_BETWEEN');
    expect(dropPosition.direction).toBe('left'); 
  });

  it('[3.2] executes column array swap when dragging within the same horizontal_layout', () => {
    // State: A row with [Input A] in column 0, and [Input B] in column 1
    const activeRow: Component = {
      id: 'row_1',
      type: 'horizontal_layout',
      isLayout: true,
      columns: [
        { id: 'col_1', fields: [{ id: 'input_A', type: 'text_input', label: 'A' }] },
        { id: 'col_2', fields: [{ id: 'input_B', type: 'text_input', label: 'B' }] }
      ]
    };
    
    // The user drags Input B over the left half of Input A
    const draggedComponent = { id: 'input_B', type: 'text_input', label: 'B' };
    const mutationCommand = { type: 'COLUMN_BETWEEN', direction: 'left', targetColumnIndex: 0 };
    
    const resultRow = executeLayoutMutation(activeRow, draggedComponent, mutationCommand);
    
    // Validating the array swap was successful
    expect(resultRow.columns[0].fields[0].id).toBe('input_B'); // B moved to left
    expect(resultRow.columns[1].fields[0].id).toBe('input_A'); // A pushed to right
    expect(resultRow.columns.length).toBe(2); // No new columns were accidentally created
  });
});

describe('Layout Engine - Canvas Reordering & Safety (Bug Fixes)', () => {

  it('[4.1] reorders existing components without creating or destroying data', () => {
    // Initial State: 3 components on the canvas
    const activeCanvas: Component[] = [
      { id: 'comp_A', type: 'text_input', label: 'First' },
      { id: 'comp_B', type: 'email_input', label: 'Second' },
      { id: 'comp_C', type: 'number_input', label: 'Third' }
    ];
    
    // Action: User drags comp_A (index 0) and drops it BETWEEN comp_B and comp_C (target index 2)
    const draggedComponent = activeCanvas[0];
    const mutationCommand = { type: 'BETWEEN', index: 2 };
    
    const resultCanvas = executeLayoutMutation(activeCanvas, draggedComponent, mutationCommand);
    
    // Verification: Array length must remain exactly 3 (no creation, no deletion)
    expect(resultCanvas.length).toBe(3);
    
    // Verification: Order must be successfully swapped to [B, A, C]
    expect(resultCanvas[0].id).toBe('comp_B');
    expect(resultCanvas[1].id).toBe('comp_A'); 
    expect(resultCanvas[2].id).toBe('comp_C');
  });

  it('[4.2] aborts state mutation and preserves data if dropped outside valid zones', () => {
    const activeCanvas: Component[] = [
      { id: 'comp_A', type: 'text_input', label: 'Only Field' }
    ];
    
    const draggedComponent = activeCanvas[0];
    
    // Action: Drop calculates as invalid/outside canvas bounds
    const mutationCommand = { type: 'INVALID_DROP_ZONE' };
    
    const resultCanvas = executeLayoutMutation(activeCanvas, draggedComponent, mutationCommand);
    
    // Verification: Data must not disappear. Array must perfectly match initial state.
    expect(resultCanvas.length).toBe(1);
    expect(resultCanvas[0].id).toBe('comp_A');
  });

  it('[4.3] rejects implicit deletion during reorder events', () => {
    const activeCanvas: Component[] = [
      { id: 'comp_A', type: 'text_input', label: 'A' },
      { id: 'comp_B', type: 'email_input', label: 'B' }
    ];
    
    // Action: User attempts to drag an item to the exact same index it currently occupies
    const draggedComponent = activeCanvas[1]; // comp_B at index 1
    const mutationCommand = { type: 'BETWEEN', index: 1 };
    
    const resultCanvas = executeLayoutMutation(activeCanvas, draggedComponent, mutationCommand);
    
    // Verification: No data loss. 
    expect(resultCanvas.length).toBe(2);
    expect(resultCanvas[1].id).toBe('comp_B');
  });
});
