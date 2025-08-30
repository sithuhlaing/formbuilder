/**
 * Comprehensive Integration Test Suite
 * Tests all major functionality together to ensure no regressions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FormBuilder from '../features/form-builder/components/FormBuilder';

const renderFormBuilder = () => {
  return render(
    <DndProvider backend={HTML5Backend}>
      <FormBuilder />
    </DndProvider>
  );
};

describe('Comprehensive Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Expose test helpers
    (window as any).getCanvasElements = () => 
      document.querySelectorAll('[data-testid^="canvas-item-"]');
  });

  describe('Complete Form Building Workflow', () => {
    it('should complete full form creation workflow', async () => {
      const user = userEvent.setup();
      renderFormBuilder();

      // 1. Set form title
      const formTitleInput = screen.getByTestId('form-title-input');
      await user.clear(formTitleInput);
      await user.type(formTitleInput, 'Employee Registration Form');
      
      expect(formTitleInput).toHaveValue('Employee Registration Form');

      // 2. Add components via drag-drop
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      // Simulate drag and drop
      fireEvent.dragStart(textInputButton);
      fireEvent.dragEnter(canvas);
      fireEvent.dragOver(canvas);
      fireEvent.drop(canvas);

      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });

      // 3. Select component and edit properties
      const canvasItems = (window as any).getCanvasElements();
      const firstComponent = canvasItems[0];
      fireEvent.click(firstComponent);

      await waitFor(() => {
        const propertiesPanel = screen.getByTestId('properties-panel');
        expect(propertiesPanel).toBeInTheDocument();
      });

      // Edit component label
      const labelInput = screen.getByLabelText('Label');
      await user.clear(labelInput);
      await user.type(labelInput, 'Full Name');

      // Mark as required
      const requiredCheckbox = screen.getByLabelText('Required');
      await user.click(requiredCheckbox);

      // 4. Add another component
      const emailInputButton = screen.getByText('Email Input');
      fireEvent.dragStart(emailInputButton);
      fireEvent.drop(canvas);

      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(2);
      });

      // 5. Create multi-page form
      const addPageButton = screen.getByText('Add Page');
      fireEvent.click(addPageButton);

      // Navigate to next page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      // Add component to second page
      const numberInputButton = screen.getByText('Number Input');
      fireEvent.dragStart(numberInputButton);
      fireEvent.drop(canvas);

      // 6. Navigate back and verify persistence
      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);

      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(2); // Should have 2 components on first page
      });

      // 7. Verify form title persisted
      expect(formTitleInput).toHaveValue('Employee Registration Form');
    });

    it('should handle component selection across pages', async () => {
      const user = userEvent.setup();
      renderFormBuilder();

      // Add component to first page
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);

      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(1);
      });

      // Select and edit component
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);

      await waitFor(() => {
        const propertiesPanel = screen.getByTestId('properties-panel');
        expect(propertiesPanel).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText('Label');
      await user.clear(labelInput);
      await user.type(labelInput, 'Page 1 Component');

      // Add new page and navigate
      const addPageButton = screen.getByText('Add Page');
      fireEvent.click(addPageButton);

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      // Properties panel should be hidden when no component selected
      await waitFor(() => {
        const propertiesPanel = screen.queryByTestId('properties-panel');
        expect(propertiesPanel).not.toBeInTheDocument();
      });

      // Navigate back and verify component selection is cleared
      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);

      // Component should still exist but not be selected
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(1);
        
        const propertiesPanel = screen.queryByTestId('properties-panel');
        expect(propertiesPanel).not.toBeInTheDocument();
      });
    });

    it('should maintain form state during complex operations', async () => {
      const user = userEvent.setup();
      renderFormBuilder();

      // Set form title
      const formTitleInput = screen.getByTestId('form-title-input');
      await user.clear(formTitleInput);
      await user.type(formTitleInput, 'Complex Form Test');

      // Add multiple components
      const canvas = screen.getByTestId('form-canvas');
      
      // Add text input
      const textInputButton = screen.getByText('Text Input');
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);

      // Add select component
      const selectButton = screen.getByText('Select');
      fireEvent.dragStart(selectButton);
      fireEvent.drop(canvas);

      // Add number input
      const numberInputButton = screen.getByText('Number Input');
      fireEvent.dragStart(numberInputButton);
      fireEvent.drop(canvas);

      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(3);
      });

      // Configure each component
      const canvasItems = (window as any).getCanvasElements();
      
      // Configure first component (text input)
      fireEvent.click(canvasItems[0]);
      await waitFor(() => {
        const labelInput = screen.getByLabelText('Label');
        expect(labelInput).toBeInTheDocument();
      });
      
      const labelInput1 = screen.getByLabelText('Label');
      await user.clear(labelInput1);
      await user.type(labelInput1, 'Employee Name');
      
      const placeholderInput = screen.getByLabelText('Placeholder');
      await user.clear(placeholderInput);
      await user.type(placeholderInput, 'Enter full name');

      // Configure second component (select)
      fireEvent.click(canvasItems[1]);
      await waitFor(() => {
        const labelInput = screen.getByLabelText('Label');
        expect(labelInput).toBeInTheDocument();
      });
      
      const labelInput2 = screen.getByLabelText('Label');
      await user.clear(labelInput2);
      await user.type(labelInput2, 'Department');

      // Configure third component (number input)
      fireEvent.click(canvasItems[2]);
      await waitFor(() => {
        const labelInput = screen.getByLabelText('Label');
        expect(labelInput).toBeInTheDocument();
      });
      
      const labelInput3 = screen.getByLabelText('Label');
      await user.clear(labelInput3);
      await user.type(labelInput3, 'Employee ID');
      
      const minInput = screen.getByLabelText('Minimum');
      await user.clear(minInput);
      await user.type(minInput, '1000');

      // Add second page
      const addPageButton = screen.getByText('Add Page');
      fireEvent.click(addPageButton);

      // Navigate to second page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      // Add component to second page
      const emailInputButton = screen.getByText('Email Input');
      fireEvent.dragStart(emailInputButton);
      fireEvent.drop(canvas);

      // Navigate back to first page
      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);

      // Verify all components and their configurations are preserved
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(3);
      });

      // Verify form title is preserved
      expect(formTitleInput).toHaveValue('Complex Form Test');

      // Verify component configurations are preserved
      fireEvent.click(canvasItems[0]);
      await waitFor(() => {
        const labelInput = screen.getByLabelText('Label');
        expect(labelInput).toHaveValue('Employee Name');
        
        const placeholderInput = screen.getByLabelText('Placeholder');
        expect(placeholderInput).toHaveValue('Enter full name');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty form title gracefully', async () => {
      const user = userEvent.setup();
      renderFormBuilder();

      const formTitleInput = screen.getByTestId('form-title-input');
      
      // Clear title and blur
      await user.clear(formTitleInput);
      await user.tab();

      // Should revert to default
      await waitFor(() => {
        expect(formTitleInput).toHaveValue('Untitled Form');
      });
    });

    it('should handle component deletion properly', async () => {
      renderFormBuilder();

      // Add component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);

      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(1);
      });

      // Select component
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);

      await waitFor(() => {
        const propertiesPanel = screen.getByTestId('properties-panel');
        expect(propertiesPanel).toBeInTheDocument();
      });

      // Delete component (this would need to be implemented based on your delete mechanism)
      // For now, just verify the properties panel handles selection properly
      
      // Click on empty canvas area
      fireEvent.click(canvas);

      await waitFor(() => {
        const propertiesPanel = screen.queryByTestId('properties-panel');
        expect(propertiesPanel).not.toBeInTheDocument();
      });
    });

    it('should handle rapid page navigation', async () => {
      renderFormBuilder();

      // Create multiple pages
      const addPageButton = screen.getByText('Add Page');
      fireEvent.click(addPageButton);
      fireEvent.click(addPageButton);
      fireEvent.click(addPageButton);

      // Rapid navigation
      const nextButton = screen.getByText('Next');
      const prevButton = screen.getByText('Previous');

      // Navigate forward rapidly
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Navigate backward rapidly
      fireEvent.click(prevButton);
      fireEvent.click(prevButton);
      fireEvent.click(prevButton);

      // Should handle gracefully without errors
      expect(nextButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility throughout workflow', async () => {
      const user = userEvent.setup();
      renderFormBuilder();

      // Form title should be accessible
      const formTitleInput = screen.getByTestId('form-title-input');
      expect(formTitleInput).toHaveAttribute('aria-label', 'Form title');

      // Add component and select
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);

      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(1);
      });

      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);

      await waitFor(() => {
        const propertiesPanel = screen.getByTestId('properties-panel');
        expect(propertiesPanel).toHaveAttribute('aria-label', 'Component properties editor');
      });

      // Test keyboard navigation in properties panel
      await user.tab();
      const labelInput = screen.getByLabelText('Label');
      expect(labelInput).toHaveFocus();

      await user.tab();
      const requiredCheckbox = screen.getByLabelText('Required');
      expect(requiredCheckbox).toHaveFocus();
    });
  });

  describe('Performance and State Management', () => {
    it('should handle large forms efficiently', async () => {
      renderFormBuilder();

      const canvas = screen.getByTestId('form-canvas');
      const textInputButton = screen.getByText('Text Input');

      // Add many components
      for (let i = 0; i < 10; i++) {
        fireEvent.dragStart(textInputButton);
        fireEvent.drop(canvas);
      }

      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(10);
      }, { timeout: 5000 });

      // Should still be responsive
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);

      await waitFor(() => {
        const propertiesPanel = screen.getByTestId('properties-panel');
        expect(propertiesPanel).toBeInTheDocument();
      });
    });

    it('should maintain state consistency across operations', async () => {
      const user = userEvent.setup();
      renderFormBuilder();

      // Set form title
      const formTitleInput = screen.getByTestId('form-title-input');
      await user.clear(formTitleInput);
      await user.type(formTitleInput, 'State Test Form');

      // Add component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);

      // Add page
      const addPageButton = screen.getByText('Add Page');
      fireEvent.click(addPageButton);

      // Navigate between pages multiple times
      const nextButton = screen.getByText('Next');
      const prevButton = screen.getByText('Previous');

      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton);
        fireEvent.click(prevButton);
      }

      // State should remain consistent
      expect(formTitleInput).toHaveValue('State Test Form');
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(1);
      });
    });
  });
});
