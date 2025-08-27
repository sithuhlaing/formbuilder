/**
 * Test Utilities for Drag & Drop TDD
 * 
 * These utilities make it easy to test drag-drop behaviors
 * without getting bogged down in DOM manipulation details.
 */

import { fireEvent } from '@testing-library/react';

export interface DragDropTestState {
  canvasElementCount: number;
  canvasElements: Element[];
  schema: any;
}

/**
 * Simulate drag and drop using React DnD Test Backend
 */
export const simulateDragDrop = async (
  source: Element,
  target: Element,
  options?: {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    offset?: { x: number; y: number };
  }
) => {
  const { position = 'center', offset } = options || {};
  
  // Calculate drop coordinates based on position
  const targetRect = target.getBoundingClientRect();
  let dropCoords = { x: targetRect.width / 2, y: targetRect.height / 2 };
  
  if (position === 'top') {
    dropCoords = { x: targetRect.width / 2, y: targetRect.height * 0.1 };
  } else if (position === 'bottom') {
    dropCoords = { x: targetRect.width / 2, y: targetRect.height * 0.9 };
  } else if (position === 'left') {
    dropCoords = { x: targetRect.width * 0.1, y: targetRect.height / 2 };
  } else if (position === 'right') {
    dropCoords = { x: targetRect.width * 0.9, y: targetRect.height / 2 };
  }
  
  if (offset) {
    dropCoords.x += offset.x;
    dropCoords.y += offset.y;
  }
  
  // Simulate the drag and drop sequence
  fireEvent.mouseDown(source, { clientX: 0, clientY: 0 });
  fireEvent.dragStart(source);
  fireEvent.dragEnter(target);
  fireEvent.dragOver(target, { clientX: dropCoords.x, clientY: dropCoords.y });
  fireEvent.drop(target, { clientX: dropCoords.x, clientY: dropCoords.y });
  fireEvent.mouseUp(target);
};

/**
 * Get current state of the canvas for assertions
 */
export const getCanvasState = (): DragDropTestState => {
  const canvas = document.querySelector('[data-testid="canvas"]') as HTMLElement;
  if (!canvas) {
    throw new Error('Canvas not found. Make sure canvas has data-testid="canvas"');
  }
  
  const canvasElements = Array.from(canvas.querySelectorAll('[data-testid^="canvas-item"]'));
  
  return {
    canvasElementCount: canvasElements.length,
    canvasElements,
    schema: null // Will be implemented when schema export is ready
  };
};

/**
 * Assert that canvas state matches expected behavior
 */
export const assertCanvasBehavior = {
  hasElementCount: (expectedCount: number) => {
    const state = getCanvasState();
    if (state.canvasElementCount !== expectedCount) {
      throw new Error(
        `Expected ${expectedCount} canvas elements, but found ${state.canvasElementCount}`
      );
    }
  },
  
  hasElementsInOrder: (expectedLabels: string[]) => {
    const state = getCanvasState();
    const actualLabels = state.canvasElements.map(el => 
      el.textContent?.trim() || ''
    );
    
    if (actualLabels.length !== expectedLabels.length) {
      throw new Error(
        `Expected ${expectedLabels.length} elements, found ${actualLabels.length}`
      );
    }
    
    expectedLabels.forEach((expectedLabel, index) => {
      if (!actualLabels[index].includes(expectedLabel)) {
        throw new Error(
          `Expected element ${index} to contain "${expectedLabel}", but found "${actualLabels[index]}"`
        );
      }
    });
  },
  
  hasRowLayout: () => {
    const rowLayout = document.querySelector('[data-testid="row-layout"]');
    if (!rowLayout) {
      throw new Error('Expected to find a row layout, but none was found');
    }
  },
  
  hasNoRowLayout: () => {
    const rowLayout = document.querySelector('[data-testid="row-layout"]');
    if (rowLayout) {
      throw new Error('Expected no row layout, but found one');
    }
  }
};

/**
 * Create test scenarios for common drag-drop patterns
 */
export const createTestScenario = {
  emptyCanvas: () => ({
    elementCount: 0,
    elements: []
  }),
  
  withElements: (count: number) => ({
    elementCount: count,
    elements: Array.from({ length: count }, (_, i) => `Element ${i + 1}`)
  }),
  
  withRowLayout: (leftElement: string, rightElement: string) => ({
    elementCount: 1, // Row counts as 1 element
    elements: [leftElement, rightElement],
    hasRowLayout: true
  })
};