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

  it('detects top half of center drop', () => {
    const cursor = { x: 50, y: 20 }; // center-top: x=50, y=20 (top 20%)
    const result = calculateDropPosition(boundingBox, cursor, true, 2);
    expect(result.type).toBe('BETWEEN');
    expect(result.index).toBe(2);
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

  it('evaluates right half direction when inside a row', () => {
    const boundingBox = { top: 0, bottom: 100, left: 0, right: 100, height: 100, width: 100 };
    const cursorPosition = { x: 60, y: 50 }; // cursor on right half: x=60
    const dropPosition = calculateDropPosition(boundingBox, cursorPosition, false, 1);
    expect(dropPosition.type).toBe('COLUMN_BETWEEN');
    expect(dropPosition.direction).toBe('right');
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

  it('[4.4] handles splicing a new component onto the canvas', () => {
    const activeCanvas: Component[] = [
      { id: 'comp_A', type: 'text_input', label: 'A' }
    ];
    const newComponent = { id: 'comp_B', type: 'email_input', label: 'B' };
    const mutationCommand = { type: 'BETWEEN', index: 0 };

    const result = executeLayoutMutation(activeCanvas, newComponent, mutationCommand);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('comp_B');
    expect(result[1].id).toBe('comp_A');
  });

  it('[4.5] handles row creation via SIDE drop mutation (both left and right)', () => {
    const activeCanvas: Component[] = [
      { id: 'comp_A', type: 'text_input', label: 'A' }
    ];
    const draggedComponent = { id: 'comp_B', type: 'email_input', label: 'B' };

    // Left Drop
    const leftCommand = { type: 'SIDE', position: 'left', targetIndex: 0 };
    const resultLeft = executeLayoutMutation(activeCanvas, draggedComponent, leftCommand);
    expect(resultLeft.length).toBe(1);
    expect(resultLeft[0].type).toBe('horizontal_layout');
    expect(resultLeft[0].columns[0].fields[0].id).toBe('comp_B');
    expect(resultLeft[0].columns[1].fields[0].id).toBe('comp_A');

    // Right Drop
    const rightCommand = { type: 'SIDE', position: 'right', targetIndex: 0 };
    const resultRight = executeLayoutMutation(activeCanvas, draggedComponent, rightCommand);
    expect(resultRight[0].columns[0].fields[0].id).toBe('comp_A');
    expect(resultRight[0].columns[1].fields[0].id).toBe('comp_B');

    // Target Component missing fallback
    const invalidTargetCommand = { type: 'SIDE', position: 'left', targetIndex: 5 };
    const resultInvalid = executeLayoutMutation(activeCanvas, draggedComponent, invalidTargetCommand);
    expect(resultInvalid).toEqual(activeCanvas);
  });

  it('[4.6] handles reordering nested columns where dragged component is not found in row', () => {
    const activeRow: Component = {
      id: 'row_1',
      type: 'horizontal_layout',
      columns: [
        { id: 'col_1', fields: [{ id: 'input_A', type: 'text_input', label: 'A' }] }
      ]
    };
    const draggedComponent = { id: 'input_B', type: 'text_input', label: 'B' };
    const command = { type: 'COLUMN_BETWEEN', direction: 'left', targetColumnIndex: 0 };

    const result = executeLayoutMutation(activeRow, draggedComponent, command);
    expect(result).toEqual(activeRow);
  });

  it('[4.7] fallback return on unknown drop command type', () => {
    const activeCanvas: Component[] = [{ id: 'comp_A', type: 'text_input' }];
    const command = { type: 'UNKNOWN_TYPE' };
    const result = executeLayoutMutation(activeCanvas, {}, command);
    expect(result).toEqual(activeCanvas);
  });
});

describe('Layout Engine - Edge Cases', () => {
  it('detects right side drop positions on the main canvas', () => {
    const boundingBox = { top: 0, bottom: 100, left: 0, right: 100, height: 100, width: 100 };
    const cursor = { x: 85, y: 50 }; // Right threshold: > 70%
    const result = calculateDropPosition(boundingBox, cursor, true, 0);

    expect(result.type).toBe('SIDE');
    expect(result.position).toBe('right');
  });

  it('preserves row layouts that have 2 or more components during cleanup', () => {
    const mockState: Component[] = [
      {
        id: 'row_1',
        type: 'horizontal_layout',
        columns: [
          { id: 'col_1', fields: [{ id: 'input_A', type: 'text_input' }] },
          { id: 'col_2', fields: [{ id: 'input_B', type: 'email_input' }] }
        ]
      },
      {
        id: 'comp_C',
        type: 'text_input'
      }
    ];

    const result = executeLayoutCleanup(mockState);
    expect(result.length).toBe(2);
    expect(result[0].type).toBe('horizontal_layout');
    expect(result[1].id).toBe('comp_C');
  });

  it('covers fallback branches for empty parameters', () => {
    // 1. cleanup with missing columns
    const emptyRow = executeLayoutCleanup([{ id: 'row_1', type: 'horizontal_layout' }]);
    expect(emptyRow).toEqual([]);

    // 2. mutation with invalid activeCanvas (not array) for BETWEEN
    const betResult = executeLayoutMutation(null, { id: 'A' }, { type: 'BETWEEN', index: 0 });
    expect(betResult).toEqual([{ id: 'A' }]);

    // 3. mutation with invalid activeCanvas for SIDE
    const sideResult = executeLayoutMutation(null, { id: 'A' }, { type: 'SIDE', position: 'left', targetIndex: 0 });
    expect(sideResult).toBeNull(); // returns activeCanvas which was null

    // 4. COLUMN_BETWEEN with missing fields in column mapping branch
    const missingFieldsRow: Component = {
      id: 'row_1',
      type: 'horizontal_layout',
      columns: [
        { id: 'col_1' }, // fields is missing
        { id: 'col_2', fields: [{ id: 'input_B' }] }
      ]
    };
    const colResult = executeLayoutMutation(missingFieldsRow, { id: 'input_B' }, { type: 'COLUMN_BETWEEN', targetColumnIndex: 0 });
    expect(colResult.columns[0].fields).toEqual([{ id: 'input_B' }]);
    expect(colResult.columns[1].fields).toEqual([]);
  });
});
