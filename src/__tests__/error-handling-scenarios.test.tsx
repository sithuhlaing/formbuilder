/**
 * Error Handling Scenarios Test Suite
 * Tests comprehensive error handling and recovery scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import App from '../App';

const renderAppWithErrorHandling = async () => {
  const result = render(
    <DndProvider backend={TestBackend}>
      <App />
    </DndProvider>
  );
  
  // Navigate to form builder
  const createButton = screen.getByRole('button', { name: /create your first form/i });
  await userEvent.click(createButton);
  
  return result;
};

const addTestComponents = async (count: number = 3) => {
  for (let i = 0; i < count; i++) {
    const addComponentFn = (window as any).__testAddComponent__;
    if (addComponentFn) {
      addComponentFn(i % 3 === 0 ? 'text_input' : i % 3 === 1 ? 'email_input' : 'textarea');
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
};

// Mock console methods to capture errors
const mockConsole = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.error = (...args) => {
    errors.push(args.join(' '));
    originalError(...args);
  };
  
  console.warn = (...args) => {
    warnings.push(args.join(' '));
    originalWarn(...args);
  };
  
  return {
    errors,
    warnings,
    restore: () => {
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
};

describe('🚨 Error Handling Scenarios', () => {
  let consoleMock: ReturnType<typeof mockConsole>;

  beforeEach(() => {
    consoleMock = mockConsole();
  });

  afterEach(() => {
    consoleMock.restore();
    cleanup();
  });

  describe('Row Capacity Exceeded Errors', () => {
    it('should prevent adding more than 4 components to horizontal layout', async () => {
      const { container } = await renderAppWithErrorHandling();
      await addTestComponents(5);
      
      // Create horizontal layout
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Try to add components beyond capacity
      const addToLayoutFn = (window as any).__testAddToRowLayout__;
      const rowLayout = container.querySelector('[data-testid="row-layout"]');
      
      if (rowLayout && addToLayoutFn) {
        const layoutId = rowLayout.getAttribute('data-component-id');
        if (layoutId) {
          // Add up to capacity (should work)
          addToLayoutFn('email_input', layoutId);
          addToLayoutFn('textarea', layoutId);
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Try to exceed capacity (should fail gracefully)
          addToLayoutFn('select', layoutId);
          addToLayoutFn('number_input', layoutId);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      // Should show error message
      const errorMessage = await waitFor(() => 
        screen.queryByText(/cannot add component.*maximum number.*4/i)
      );
      expect(errorMessage || consoleMock.errors.some(e => e.includes('maximum'))).toBeTruthy();
      
      // Should not exceed 4 items in row
      const rowItems = container.querySelectorAll('[data-testid^="row-item-"]');
      expect(rowItems.length).toBeLessThanOrEqual(4);
    });

    it('should show alternative drop zones when capacity exceeded', async () => {
      const { container } = await renderAppWithErrorHandling();
      await addTestComponents(4);
      
      // Create full horizontal layout (4 components)
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      const addToLayoutFn = (window as any).__testAddToRowLayout__;
      
      if (createHorizontalFn && addToLayoutFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const rowLayout = container.querySelector('[data-testid="row-layout"]');
        if (rowLayout) {
          const layoutId = rowLayout.getAttribute('data-component-id');
          if (layoutId) {
            addToLayoutFn('email_input', layoutId);
            addToLayoutFn('textarea', layoutId);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      
      // Try to add another component - should highlight alternative zones
      const dragStartFn = (window as any).__testStartDrag__;
      if (dragStartFn) {
        dragStartFn('select');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Should show drop zones above/below the row instead of inside
      const dropZones = container.querySelectorAll('.drop-zone--alternative, .drop-zone--above, .drop-zone--below');
      expect(dropZones.length).toBeGreaterThan(0);
    });
  });

  describe('Invalid Component Type Errors', () => {
    it('should prevent section_divider in horizontal layouts', async () => {
      const { container } = await renderAppWithErrorHandling();
      await addTestComponents(2);
      
      // Create horizontal layout
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Try to add section_divider to horizontal layout
      const addToLayoutFn = (window as any).__testAddToRowLayout__;
      const rowLayout = container.querySelector('[data-testid="row-layout"]');
      
      if (rowLayout && addToLayoutFn) {
        const layoutId = rowLayout.getAttribute('data-component-id');
        if (layoutId) {
          addToLayoutFn('section_divider', layoutId);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Should show error message
      const errorMessage = await waitFor(() => 
        screen.queryByText(/cannot be added to horizontal layout/i)
      );
      expect(errorMessage || consoleMock.errors.some(e => e.includes('section_divider'))).toBeTruthy();
      
      // Section divider should not be in the row
      const sectionDividers = container.querySelectorAll('[data-component-type="section_divider"]');
      const rowItems = container.querySelectorAll('[data-testid^="row-item-"] [data-component-type="section_divider"]');
      expect(rowItems.length).toBe(0);
    });

    it('should show valid drop areas for restricted components', async () => {
      const { container } = await renderAppWithErrorHandling();
      await addTestComponents(2);
      
      // Create horizontal layout
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Start dragging section_divider
      const dragStartFn = (window as any).__testStartDrag__;
      if (dragStartFn) {
        dragStartFn('section_divider');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Should highlight valid drop zones (above/below row, not inside)
      const validZones = container.querySelectorAll('.drop-zone--valid');
      const invalidZones = container.querySelectorAll('.drop-zone--invalid, .drop-zone--blocked');
      
      expect(validZones.length).toBeGreaterThan(0);
      expect(invalidZones.length).toBeGreaterThan(0);
    });
  });

  describe('Layout Dissolution Conflicts', () => {
    it('should handle empty horizontal layout gracefully', async () => {
      const { container } = await renderAppWithErrorHandling();
      await addTestComponents(2);
      
      // Create horizontal layout
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Delete all components from the row
      const deleteComponentFn = (window as any).__testDeleteComponent__;
      const rowItems = container.querySelectorAll('[data-testid^="row-item-"] [data-component-id]');
      
      if (deleteComponentFn && rowItems.length > 0) {
        for (const item of Array.from(rowItems)) {
          const componentId = item.getAttribute('data-component-id');
          if (componentId) {
            deleteComponentFn(componentId);
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      }
      
      // Row layout should be automatically dissolved
      await waitFor(() => {
        const rowLayout = container.querySelector('[data-testid="row-layout"]');
        expect(rowLayout).toBeFalsy();
      });
      
      // Should not show error messages for auto-dissolution
      expect(consoleMock.errors.filter(e => e.includes('dissolution')).length).toBe(0);
    });

    it('should auto-dissolve single-child horizontal layouts', async () => {
      const { container } = await renderAppWithErrorHandling();
      await addTestComponents(3);
      
      // Create horizontal layout with 2 components
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Delete one component, leaving only one
      const deleteComponentFn = (window as any).__testDeleteComponent__;
      const rowItems = container.querySelectorAll('[data-testid^="row-item-"] [data-component-id]');
      
      if (deleteComponentFn && rowItems.length > 0) {
        const componentId = rowItems[0].getAttribute('data-component-id');
        if (componentId) {
          deleteComponentFn(componentId);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Row layout should be dissolved, remaining component promoted
      await waitFor(() => {
        const rowLayout = container.querySelector('[data-testid="row-layout"]');
        expect(rowLayout).toBeFalsy();
      });
      
      // Remaining component should be at canvas level
      const canvasComponents = container.querySelectorAll('.canvas-container > [data-component-id]');
      expect(canvasComponents.length).toBeGreaterThan(0);
    });
  });

  describe('State Corruption Recovery', () => {
    it('should recover from corrupted component data', async () => {
      const { container } = await renderAppWithErrorHandling();
      await addTestComponents(2);
      
      // Simulate corrupted state by directly manipulating component data
      const corruptStateFn = (window as any).__testCorruptState__;
      if (corruptStateFn) {
        corruptStateFn({
          componentId: 'component-0',
          corruption: { type: null, id: undefined }
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // App should still function and show error recovery
      const components = container.querySelectorAll('[data-component-id]');
      expect(components.length).toBeGreaterThan(0);
      
      // Should log recovery attempt
      expect(consoleMock.warnings.some(w => w.includes('recovering') || w.includes('corrupted'))).toBeTruthy();
    });

    it('should handle invalid JSON imports gracefully', async () => {
      await renderAppWithErrorHandling();
      
      // Try to import invalid JSON
      const importFn = (window as any).__testImportJSON__;
      if (importFn) {
        const invalidJSON = '{ invalid json structure }';
        importFn(invalidJSON);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Should show error message
      const errorMessage = await waitFor(() => 
        screen.queryByText(/invalid.*json/i) || screen.queryByText(/import.*failed/i)
      );
      expect(errorMessage || consoleMock.errors.some(e => e.includes('JSON'))).toBeTruthy();
      
      // App should remain functional
      const canvas = screen.getByTestId('canvas-container');
      expect(canvas).toBeTruthy();
    });

    it('should validate component relationships', async () => {
      const { container } = await renderAppWithErrorHandling();
      await addTestComponents(3);
      
      // Create invalid relationship (component referencing non-existent parent)
      const createInvalidRelationFn = (window as any).__testCreateInvalidRelation__;
      if (createInvalidRelationFn) {
        createInvalidRelationFn({
          componentId: 'component-0',
          parentId: 'non-existent-parent'
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Should detect and fix invalid relationships
      expect(consoleMock.warnings.some(w => w.includes('invalid relationship'))).toBeTruthy();
      
      // Component should still be rendered correctly
      const component = container.querySelector('[data-component-id="component-0"]');
      expect(component).toBeTruthy();
    });
  });

  describe('Network and Storage Errors', () => {
    it('should handle template save failures', async () => {
      await renderAppWithErrorHandling();
      
      // Mock network failure
      const originalFetch = global.fetch;
      global.fetch = () => Promise.reject(new Error('Network error'));
      
      try {
        // Try to save template
        const saveButton = screen.getByRole('button', { name: /save template/i });
        await userEvent.click(saveButton);
        
        // Should show error message
        const errorMessage = await waitFor(() => 
          screen.queryByText(/save.*failed/i) || screen.queryByText(/network.*error/i)
        );
        expect(errorMessage || consoleMock.errors.some(e => e.includes('save'))).toBeTruthy();
        
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should handle localStorage quota exceeded', async () => {
      await renderAppWithErrorHandling();
      
      // Mock localStorage quota exceeded
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('QuotaExceededError');
      };
      
      try {
        // Try to save large form
        const addComponentFn = (window as any).__testAddComponent__;
        if (addComponentFn) {
          // Add many components to exceed quota
          for (let i = 0; i < 100; i++) {
            addComponentFn('text_input');
          }
        }
        
        // Should handle quota error gracefully
        expect(consoleMock.errors.some(e => e.includes('storage') || e.includes('quota'))).toBeTruthy();
        
      } finally {
        Storage.prototype.setItem = originalSetItem;
      }
    });
  });

  describe('User Input Validation', () => {
    it('should validate component labels', async () => {
      const { container } = await renderAppWithErrorHandling();
      await addTestComponents(1);
      
      // Select component and try to set invalid label
      const component = container.querySelector('[data-component-id]');
      if (component) {
        (component as HTMLElement).click();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const labelInput = screen.queryByLabelText(/label/i) || screen.queryByDisplayValue(/text input/i);
      if (labelInput) {
        await userEvent.clear(labelInput);
        await userEvent.type(labelInput, ''); // Empty label
        await userEvent.tab(); // Trigger validation
        
        // Should show validation error
        const errorMessage = await waitFor(() => 
          screen.queryByText(/label.*required/i) || screen.queryByText(/cannot be empty/i)
        );
        expect(errorMessage || consoleMock.warnings.some(w => w.includes('label'))).toBeTruthy();
      }
    });

    it('should validate field IDs for uniqueness', async () => {
      const { container } = await renderAppWithErrorHandling();
      await addTestComponents(2);
      
      // Try to set duplicate field IDs
      const components = container.querySelectorAll('[data-component-id]');
      if (components.length >= 2) {
        // Select first component
        (components[0] as HTMLElement).click();
        await new Promise(resolve => setTimeout(resolve, 50));
        
        let fieldIdInput = screen.queryByLabelText(/field.*id/i);
        if (fieldIdInput) {
          await userEvent.clear(fieldIdInput);
          await userEvent.type(fieldIdInput, 'duplicate-id');
          await userEvent.tab();
        }
        
        // Select second component
        (components[1] as HTMLElement).click();
        await new Promise(resolve => setTimeout(resolve, 50));
        
        fieldIdInput = screen.queryByLabelText(/field.*id/i);
        if (fieldIdInput) {
          await userEvent.clear(fieldIdInput);
          await userEvent.type(fieldIdInput, 'duplicate-id'); // Same ID
          await userEvent.tab();
        }
        
        // Should show uniqueness error
        const errorMessage = await waitFor(() => 
          screen.queryByText(/field.*id.*unique/i) || screen.queryByText(/already exists/i)
        );
        expect(errorMessage || consoleMock.warnings.some(w => w.includes('duplicate'))).toBeTruthy();
      }
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should maintain app stability after multiple errors', async () => {
      const { container } = await renderAppWithErrorHandling();
      
      // Trigger multiple error scenarios
      const scenarios = [
        () => (window as any).__testAddComponent__?.('invalid_type'),
        () => (window as any).__testCorruptState__?.({ invalid: 'data' }),
        () => (window as any).__testExceedCapacity__?.(),
        () => (window as any).__testInvalidDrop__?.()
      ];
      
      for (const scenario of scenarios) {
        try {
          scenario();
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          // Errors are expected, continue testing
        }
      }
      
      // App should still be functional
      const canvas = container.querySelector('.canvas-container');
      expect(canvas).toBeTruthy();
      
      // Should be able to add components normally
      const addComponentFn = (window as any).__testAddComponent__;
      if (addComponentFn) {
        addComponentFn('text_input');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const components = container.querySelectorAll('[data-component-id]');
      expect(components.length).toBeGreaterThan(0);
    });

    it('should provide helpful error messages to users', async () => {
      await renderAppWithErrorHandling();
      
      // Trigger various errors and check for user-friendly messages
      const triggerErrorFn = (window as any).__testTriggerError__;
      if (triggerErrorFn) {
        triggerErrorFn('capacity_exceeded');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Should show user-friendly error, not technical details
      const userFriendlyMessage = await waitFor(() => 
        screen.queryByText(/cannot add more components/i) ||
        screen.queryByText(/maximum.*reached/i)
      );
      
      expect(userFriendlyMessage).toBeTruthy();
      
      // Should not show technical stack traces to users
      const technicalError = screen.queryByText(/stack trace/i) || screen.queryByText(/undefined.*null/i);
      expect(technicalError).toBeFalsy();
    });
  });
});
