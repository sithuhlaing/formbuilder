/**
 * Complex Layout Scenarios Test Suite
 * 
 * Tests the advanced drag-drop layout logic described by the user:
 * - Empty canvas: only vertical layout (top/bottom)
 * - Two elements: vertical OR horizontal side-by-side
 * - Three elements: big horizontal row OR big vertical column
 * - Pull-out logic: complex restructuring scenarios
 * - Row dissolution: automatic container management
 */

import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import App from '../../App';

// Test utilities for complex drag-drop scenarios
const renderAppWithComplexDragDrop = async () => {
  const testBackendFactory = TestBackend;
  
  const result = render(
    <DndProvider backend={testBackendFactory}>
      <App />
    </DndProvider>
  );
  
  // Navigate to form builder
  const createNewButton = screen.getByRole('button', { name: /create your first form/i });
  await userEvent.click(createNewButton);
  
  // Helper functions for complex scenarios
  const addComponentToCanvas = async (componentType: string): Promise<void> => {
    try {
      const inputsAccordion = screen.getByText('Input Fields');
      if (inputsAccordion.getAttribute('aria-expanded') === 'false') {
        await userEvent.click(inputsAccordion);
        await new Promise<void>(resolve => setTimeout(resolve, 100));
      }
    } catch {
      // Accordion might already be expanded
    }
    
    const paletteItem = screen.getByText(componentType);
    await userEvent.click(paletteItem);
    await new Promise<void>(resolve => setTimeout(resolve, 600));
  };

  const createHorizontalLayout = async (existingElementIndex: number, newComponentType: string, side: 'left' | 'right'): Promise<void> => {
    const insertHorizontalToComponent = (window as any).__testInsertHorizontalToComponent__;
    if (insertHorizontalToComponent) {
      const existingElement = screen.getByTestId(`canvas-item-${existingElementIndex}`);
      const componentId = existingElement.getAttribute('data-component-id') || 'component-id';
      
      await act(async () => {
        insertHorizontalToComponent(newComponentType, componentId, side);
        await new Promise(resolve => setTimeout(resolve, 100));
      });
    } else {
      throw new Error('insertHorizontalToComponent not available for testing');
    }
  };

  const pullElementFromRow = async (rowLayoutTestId: string, elementIndex: number, targetPosition: { x: number, y: number }): Promise<void> => {
    const pullElementFromRowHelper = (window as any).__testPullElementFromRow__;
    if (pullElementFromRowHelper) {
      const rowLayout = screen.getByTestId(rowLayoutTestId);
      const rowLayoutId = rowLayout.getAttribute('data-component-id');
      
      if (rowLayoutId) {
        await act(async () => {
          pullElementFromRowHelper(rowLayoutId, elementIndex, JSON.stringify(targetPosition));
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }
    } else {
      // Fallback to drag-and-drop simulation
      const rowLayout = screen.getByTestId(rowLayoutTestId);
      const rowItems = rowLayout.querySelectorAll('[data-testid^="row-item"]');
      const elementToPull = rowItems[elementIndex];
      
      if (elementToPull) {
        await userEvent.pointer([
          { target: elementToPull, keys: '[MouseLeft>]' },
          { coords: targetPosition },
          { keys: '[/MouseLeft]' }
        ]);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  const getLayoutStructure = () => {
    const canvas = screen.getByTestId('canvas') || screen.getByRole('main');
    const rowLayouts = Array.from(canvas.querySelectorAll('[data-testid="row-layout"]'));
    
    // Only count canvas items that are NOT inside row layouts
    const allCanvasItems = Array.from(canvas.querySelectorAll('[data-testid^="canvas-item"]'));
    const canvasItems = allCanvasItems.filter(item => {
      // Check if this item is inside a row layout
      return !item.closest('[data-testid="row-layout"]');
    });
    
    return {
      canvasItems: canvasItems.length,
      rowLayouts: rowLayouts.length,
      totalElements: canvasItems.length + rowLayouts.length,
      structure: {
        canvas: canvasItems.map(item => ({
          testId: item.getAttribute('data-testid'),
          content: item.textContent?.replace(/[⋮×]/g, '').trim()
        })),
        rows: rowLayouts.map(row => ({
          testId: row.getAttribute('data-testid'),
          itemCount: row.querySelectorAll('[data-testid^="row-item"]').length,
          items: Array.from(row.querySelectorAll('[data-testid^="row-item"]')).map(item => 
            item.textContent?.replace(/[⋮×]/g, '').trim()
          )
        }))
      }
    };
  };

  return {
    ...result,
    addComponentToCanvas,
    createHorizontalLayout,
    pullElementFromRow,
    getLayoutStructure
  };
};

describe('🧪 Complex Layout Scenarios', () => {
  
  // ============================================================================
  // K. THREE-ELEMENT LAYOUT CHOICE LOGIC
  // ============================================================================
  
  describe('K. Three-Element Layout Choice Logic', () => {
    
    it('✅ K1: Three elements → Big horizontal row layout (all side-by-side)', async () => {
      const { addComponentToCanvas, createHorizontalLayout, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Add first element (vertical column mode)
      await addComponentToCanvas('Text Input');
      let structure = getLayoutStructure();
      expect(structure.canvasItems).toBe(1);
      expect(structure.rowLayouts).toBe(0);
      
      // Create horizontal layout with second element (side-by-side)
      await createHorizontalLayout(0, 'email_input', 'right');
      structure = getLayoutStructure();
      expect(structure.canvasItems).toBe(0); // Elements moved to row
      expect(structure.rowLayouts).toBe(1);
      expect(structure.structure.rows[0].itemCount).toBe(2);
      
      // Add third element to the row (big horizontal layout)
      const addToRowLayout = (window as any).__testAddToRowLayout__;
      if (addToRowLayout) {
        const rowLayout = screen.getByTestId('row-layout');
        await act(async () => {
          addToRowLayout('number_input', rowLayout.getAttribute('data-component-id'));
          await new Promise(resolve => setTimeout(resolve, 100));
        });
        
        structure = getLayoutStructure();
        expect(structure.rowLayouts).toBe(1);
        expect(structure.structure.rows[0].itemCount).toBe(3);
        expect(structure.structure.rows[0].items).toEqual([
          'Text Input',
          'Email Input',
          'Number Input'
        ]);
      }
    });
    
    it('✅ K2: Three elements → Big vertical column layout (default mode)', async () => {
      const { addComponentToCanvas, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Add three elements in vertical column mode (default)
      await addComponentToCanvas('Text Input');
      await addComponentToCanvas('Email Input');
      await addComponentToCanvas('Number Input');
      
      const structure = getLayoutStructure();
      
      // Should have 3 canvas items in vertical column layout (no row layouts)
      expect(structure.canvasItems).toBe(3);
      expect(structure.rowLayouts).toBe(0);
      expect(structure.structure.canvas).toEqual([
        { testId: 'canvas-item-0', content: 'Text Input' },
        { testId: 'canvas-item-1', content: 'Email Input' },
        { testId: 'canvas-item-2', content: 'Number Input' }
      ]);
    });
    
    it('✅ K3: Choice between horizontal row vs vertical column based on drop position', async () => {
      const { addComponentToCanvas, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Add two elements first
      await addComponentToCanvas('Text Input');
      await addComponentToCanvas('Email Input');
      
      let structure = getLayoutStructure();
      expect(structure.canvasItems).toBe(2); // Vertical column by default
      
      // Test: Drop third element on RIGHT side of first element → should create horizontal row
      const firstElement = screen.getByTestId('canvas-item-0');
      await userEvent.pointer([
        { target: screen.getByText('Number Input'), keys: '[MouseLeft>]' },
        { target: firstElement, coords: { x: 120, y: 25 } }, // Right side (25% threshold)
        { keys: '[/MouseLeft]' }
      ]);
      
      structure = getLayoutStructure();
      
      // Should now have horizontal layout containing the repositioned elements
      expect(structure.rowLayouts).toBeGreaterThan(0);
      
      // Test: Drop fourth element on BOTTOM of remaining column element → maintains vertical
      if (structure.canvasItems > 0) {
        const remainingElement = screen.getByTestId('canvas-item-0');
        await userEvent.pointer([
          { target: screen.getByText('Text Area'), keys: '[MouseLeft>]' },
          { target: remainingElement, coords: { x: 50, y: 80 } }, // Bottom 30% zone
          { keys: '[/MouseLeft]' }
        ]);
        
        const finalStructure = getLayoutStructure();
        expect(finalStructure.canvasItems).toBeGreaterThan(1); // Maintains vertical column
      }
    });
  });
  
  // ============================================================================
  // L. COMPLEX PULL-OUT RESTRUCTURING (3→2+1 scenarios)
  // ============================================================================
  
  describe('L. Complex Pull-Out Restructuring', () => {
    
    it('✅ L1: Pull one element from 3-element row → 2 remain in row + 1 becomes column', async () => {
      const { addComponentToCanvas, createHorizontalLayout, pullElementFromRow, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Create 3-element horizontal row
      await addComponentToCanvas('Text Input');
      await createHorizontalLayout(0, 'email_input', 'right');
      
      const addToRowLayout = (window as any).__testAddToRowLayout__;
      if (addToRowLayout) {
        const rowLayout = screen.getByTestId('row-layout');
        await act(async () => {
          addToRowLayout('number_input', rowLayout.getAttribute('data-component-id'));
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }
      
      let structure = getLayoutStructure();
      expect(structure.structure.rows[0].itemCount).toBe(3);
      
      // Pull out the middle element to column area (below the row)
      await pullElementFromRow('row-layout', 1, { x: 50, y: 200 });
      
      structure = getLayoutStructure();
      
      // Should have: 1 row layout with 2 elements + 1 canvas item
      expect(structure.rowLayouts).toBe(1);
      expect(structure.structure.rows[0].itemCount).toBe(2);
      expect(structure.canvasItems).toBe(1);
      
      // Verify the pulled element is now in column layout
      expect(structure.structure.canvas[0].content).toContain('Email Input');
    });
    
    it('✅ L2: Pull out entire row layout → all 3 elements become column layout', async () => {
      const { addComponentToCanvas, createHorizontalLayout, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Create 3-element horizontal row
      await addComponentToCanvas('Text Input');
      await createHorizontalLayout(0, 'email_input', 'right');
      
      const addToRowLayout = (window as any).__testAddToRowLayout__;
      if (addToRowLayout) {
        const rowLayout = screen.getByTestId('row-layout');
        await act(async () => {
          addToRowLayout('number_input', rowLayout.getAttribute('data-component-id'));
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }
      
      let structure = getLayoutStructure();
      expect(structure.structure.rows[0].itemCount).toBe(3);
      
      // Pull out the entire row layout by dragging it to dissolve
      const dissolveRowLayout = (window as any).__testDissolveRowLayout__;
      if (dissolveRowLayout) {
        const rowLayout = screen.getByTestId('row-layout');
        await act(async () => {
          dissolveRowLayout(rowLayout.getAttribute('data-component-id'));
          await new Promise(resolve => setTimeout(resolve, 100));
        });
        
        structure = getLayoutStructure();
        
        // All elements should now be in column layout, no row layouts
        expect(structure.rowLayouts).toBe(0);
        expect(structure.canvasItems).toBe(3);
        expect(structure.structure.canvas).toEqual([
          { testId: 'canvas-item-0', content: 'Text Input' },
          { testId: 'canvas-item-1', content: 'Email Input' },
          { testId: 'canvas-item-2', content: 'Number Input' }
        ]);
      }
    });
    
    it('✅ L3: Complex restructuring: 4 elements → pull 2 out → 2 in row + 2 in column', async () => {
      const { addComponentToCanvas, createHorizontalLayout, pullElementFromRow, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Create 4-element horizontal row (maximum row capacity)
      await addComponentToCanvas('Text Input');
      await createHorizontalLayout(0, 'email_input', 'right');
      
      const addToRowLayout = (window as any).__testAddToRowLayout__;
      if (addToRowLayout) {
        const rowLayout = screen.getByTestId('row-layout');
        
        // Add third element
        await act(async () => {
          addToRowLayout('number_input', rowLayout.getAttribute('data-component-id'));
          await new Promise(resolve => setTimeout(resolve, 50));
        });
        
        // Add fourth element
        await act(async () => {
          addToRowLayout('textarea', rowLayout.getAttribute('data-component-id'));
          await new Promise(resolve => setTimeout(resolve, 50));
        });
      }
      
      let structure = getLayoutStructure();
      expect(structure.structure.rows[0].itemCount).toBe(4);
      
      // Pull out two elements (index 1 and 3) to create mixed layout
      await pullElementFromRow('row-layout', 1, { x: 50, y: 150 });
      await pullElementFromRow('row-layout', 2, { x: 50, y: 250 }); // Index shifts after first pull
      
      structure = getLayoutStructure();
      
      // Should have: 1 row with 2 elements + 2 canvas items
      expect(structure.rowLayouts).toBe(1);
      expect(structure.structure.rows[0].itemCount).toBe(2);
      expect(structure.canvasItems).toBe(2);
      
      // Verify mixed layout structure
      expect(structure.structure.rows[0].items).toHaveLength(2);
      expect(structure.structure.canvas).toHaveLength(2);
    });
  });
  
  // ============================================================================
  // M. ADVANCED ROW DISSOLUTION AND RESTRUCTURING
  // ============================================================================
  
  describe('M. Advanced Row Dissolution', () => {
    
    it('✅ M1: Row with 2 elements → remove 1 → automatic dissolution to column', async () => {
      const { addComponentToCanvas, createHorizontalLayout, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Create 2-element row
      await addComponentToCanvas('Text Input');
      await createHorizontalLayout(0, 'email_input', 'right');
      
      let structure = getLayoutStructure();
      expect(structure.structure.rows[0].itemCount).toBe(2);
      
      // Delete one element from the row
      const rowLayout = screen.getByTestId('row-layout');
      const rowItems = rowLayout.querySelectorAll('[data-testid^="row-item"]');
      const deleteButton = rowItems[0].querySelector('.form-component__hover-action--delete');
      
      if (deleteButton) {
        await act(async () => {
          (deleteButton as HTMLElement).click();
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }
      
      structure = getLayoutStructure();
      
      // Row should be dissolved, remaining element promoted to column
      expect(structure.rowLayouts).toBe(0);
      expect(structure.canvasItems).toBe(1);
      expect(structure.structure.canvas[0].content).toContain('Input');
    });
    
    it('✅ M2: Multiple rows → dissolve one → others remain intact', async () => {
      const { addComponentToCanvas, createHorizontalLayout, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Create first row
      await addComponentToCanvas('Text Input');
      await createHorizontalLayout(0, 'email_input', 'right');
      
      // Add standalone element
      await addComponentToCanvas('Number Input');
      
      // Create second row from the standalone element
      const standaloneElement = screen.getByTestId('canvas-item-0');
      await userEvent.pointer([
        { target: screen.getByText('Text Area'), keys: '[MouseLeft>]' },
        { target: standaloneElement, coords: { x: 120, y: 25 } },
        { keys: '[/MouseLeft]' }
      ]);
      
      let structure = getLayoutStructure();
      expect(structure.rowLayouts).toBe(2);
      
      // Dissolve first row by removing one element
      const firstRow = screen.getAllByTestId('row-layout')[0];
      const rowItems = firstRow.querySelectorAll('[data-testid^="row-item"]');
      const deleteButton = rowItems[0].querySelector('.form-component__hover-action--delete');
      
      if (deleteButton) {
        await act(async () => {
          (deleteButton as HTMLElement).click();
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }
      
      structure = getLayoutStructure();
      
      // Should have 1 row remaining + 1 promoted element
      expect(structure.rowLayouts).toBe(1);
      expect(structure.canvasItems).toBe(1);
      expect(structure.structure.rows[0].itemCount).toBe(2); // Second row intact
    });
    
    it('✅ M3: Cascade dissolution: Remove elements until all become column', async () => {
      const { addComponentToCanvas, createHorizontalLayout, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Create 3-element row
      await addComponentToCanvas('Text Input');
      await createHorizontalLayout(0, 'email_input', 'right');
      
      const addToRowLayout = (window as any).__testAddToRowLayout__;
      if (addToRowLayout) {
        const rowLayout = screen.getByTestId('row-layout');
        await act(async () => {
          addToRowLayout('number_input', rowLayout.getAttribute('data-component-id'));
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }
      
      let structure = getLayoutStructure();
      expect(structure.structure.rows[0].itemCount).toBe(3);
      
      // Remove first element (3 → 2, row remains)
      let rowLayout = screen.getByTestId('row-layout');
      let rowItems = rowLayout.querySelectorAll('[data-testid^="row-item"]');
      let deleteButton = rowItems[0].querySelector('.form-component__hover-action--delete');
      
      if (deleteButton) {
        await act(async () => {
          (deleteButton as HTMLElement).click();
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }
      
      structure = getLayoutStructure();
      expect(structure.rowLayouts).toBe(1);
      expect(structure.structure.rows[0].itemCount).toBe(2);
      
      // Remove second element (2 → 1, triggers dissolution)
      rowLayout = screen.getByTestId('row-layout');
      rowItems = rowLayout.querySelectorAll('[data-testid^="row-item"]');
      deleteButton = rowItems[0].querySelector('.form-component__hover-action--delete');
      
      if (deleteButton) {
        await act(async () => {
          (deleteButton as HTMLElement).click();
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }
      
      structure = getLayoutStructure();
      
      // All elements should now be in column layout
      expect(structure.rowLayouts).toBe(0);
      expect(structure.canvasItems).toBe(1); // One element remains
    });
  });
  
  // ============================================================================
  // N. NESTED LAYOUT PREVENTION AND MERGING
  // ============================================================================
  
  describe('N. Nested Layout Prevention', () => {
    
    it('✅ N1: Prevent nested rows → merge into single row instead', async () => {
      const { addComponentToCanvas, createHorizontalLayout, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Create first row
      await addComponentToCanvas('Text Input');
      await createHorizontalLayout(0, 'email_input', 'right');
      
      let structure = getLayoutStructure();
      expect(structure.rowLayouts).toBe(1);
      
      // Try to create nested row by dropping on left edge of existing row item
      const rowLayout = screen.getByTestId('row-layout');
      const firstRowItem = rowLayout.querySelector('[data-testid^="row-item"]');
      
      await userEvent.pointer([
        { target: screen.getByText('Number Input'), keys: '[MouseLeft>]' },
        { target: firstRowItem, coords: { x: -10, y: 25 } }, // Far left edge
        { keys: '[/MouseLeft]' }
      ]);
      
      structure = getLayoutStructure();
      
      // Should still have only 1 row, but with 3 elements (merged, not nested)
      expect(structure.rowLayouts).toBe(1);
      expect(structure.structure.rows[0].itemCount).toBe(3);
      
      // Verify no nested row structures exist
      const nestedRows = rowLayout.querySelectorAll('[data-testid="row-layout"]');
      expect(nestedRows).toHaveLength(0);
    });
    
    it('✅ N2: Row inside column → no nested columns allowed', async () => {
      const { addComponentToCanvas, createHorizontalLayout, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Create column with row inside
      await addComponentToCanvas('Text Input'); // Column element
      await createHorizontalLayout(0, 'email_input', 'right'); // Creates row
      await addComponentToCanvas('Number Input'); // Another column element
      
      let structure = getLayoutStructure();
      expect(structure.rowLayouts).toBe(1);
      expect(structure.canvasItems).toBe(1);
      
      // Try to create nested column by dropping on top/bottom of row
      const rowLayout = screen.getByTestId('row-layout');
      
      await userEvent.pointer([
        { target: screen.getByText('Text Area'), keys: '[MouseLeft>]' },
        { target: rowLayout, coords: { x: 50, y: 10 } }, // Top edge
        { keys: '[/MouseLeft]' }
      ]);
      
      structure = getLayoutStructure();
      
      // Should maintain flat structure: no nested columns
      expect(structure.canvasItems).toBe(2); // New element added to column level
      expect(structure.rowLayouts).toBe(1); // Row remains intact
      
      // Verify structure is flat (row at same level as column elements)
      expect(structure.structure.canvas).toHaveLength(2);
      expect(structure.structure.rows).toHaveLength(1);
    });
    
    it('✅ N3: Maximum row capacity → overflow to column', async () => {
      const { addComponentToCanvas, createHorizontalLayout, getLayoutStructure } = await renderAppWithComplexDragDrop();
      
      // Create maximum capacity row (4 elements)
      await addComponentToCanvas('Text Input');
      await createHorizontalLayout(0, 'email_input', 'right');
      
      const addToRowLayout = (window as any).__testAddToRowLayout__;
      if (addToRowLayout) {
        const rowLayout = screen.getByTestId('row-layout');
        
        // Add third element
        await act(async () => {
          addToRowLayout('number_input', rowLayout.getAttribute('data-component-id'));
          await new Promise(resolve => setTimeout(resolve, 50));
        });
        
        // Add fourth element (maximum capacity)
        await act(async () => {
          addToRowLayout('textarea', rowLayout.getAttribute('data-component-id'));
          await new Promise(resolve => setTimeout(resolve, 50));
        });
      }
      
      let structure = getLayoutStructure();
      expect(structure.structure.rows[0].itemCount).toBe(4);
      
      // Try to add fifth element → should overflow to column
      await addComponentToCanvas('Date Picker');
      
      structure = getLayoutStructure();
      
      // Should have: 1 row with 4 elements + 1 column element
      expect(structure.rowLayouts).toBe(1);
      expect(structure.structure.rows[0].itemCount).toBe(4);
      expect(structure.canvasItems).toBe(1);
      expect(structure.structure.canvas[0].content).toContain('Date Picker');
    });
  });
});
