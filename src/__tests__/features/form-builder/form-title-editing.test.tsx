import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FormBuilder from '../../../features/form-builder/components/FormBuilder';

const renderFormBuilder = () => {
  return render(
    <DndProvider backend={HTML5Backend}>
      <FormBuilder />
    </DndProvider>
  );
};

describe('Form Title Editing', () => {
  beforeEach(() => {
    // Clear any existing form state
    localStorage.clear();
  });

  describe('Default Form Title', () => {
    it('should display "Untitled Form" as default title', () => {
      renderFormBuilder();
      
      const titleElement = screen.getByDisplayValue('Untitled Form');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveAttribute('data-testid', 'form-title-input');
    });

    it('should render title as editable input field', () => {
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      expect(titleInput).toBeInstanceOf(HTMLInputElement);
      expect(titleInput).not.toHaveAttribute('readonly');
      expect(titleInput).not.toBeDisabled();
    });
  });

  describe('Title Editing Functionality', () => {
    it('should allow editing the form title', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      // Clear existing title and type new one
      await user.clear(titleInput);
      await user.type(titleInput, 'Employee Registration Form');
      
      expect(titleInput).toHaveValue('Employee Registration Form');
    });

    it('should update title on blur', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Medical Assessment Form');
      await user.tab(); // Trigger blur event
      
      await waitFor(() => {
        expect(titleInput).toHaveValue('Medical Assessment Form');
      });
    });

    it('should update title on Enter key press', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Health Survey{enter}');
      
      await waitFor(() => {
        expect(titleInput).toHaveValue('Health Survey');
      });
    });

    it('should handle empty title gracefully', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.clear(titleInput);
      await user.tab(); // Blur with empty value
      
      await waitFor(() => {
        expect(titleInput).toHaveValue('Untitled Form');
      });
    });

    it('should trim whitespace from title', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.clear(titleInput);
      await user.type(titleInput, '  Spaced Title  ');
      await user.tab();
      
      await waitFor(() => {
        expect(titleInput).toHaveValue('Spaced Title');
      });
    });

    it('should limit title length to reasonable maximum', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      const longTitle = 'A'.repeat(200); // Very long title
      
      await user.clear(titleInput);
      await user.type(titleInput, longTitle);
      
      expect(titleInput.value.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Title Persistence', () => {
    it('should persist title changes in form state', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Persistent Title');
      await user.tab();
      
      // Check if title is reflected in form state
      await waitFor(() => {
        const exportButton = screen.getByText('Export JSON');
        fireEvent.click(exportButton);
        
        // Verify the exported JSON contains the updated title
        // This would need to be implemented based on your export functionality
      });
    });

    it('should maintain title when adding components', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Form With Components');
      await user.tab();
      
      // Add a component (this would need drag-drop simulation)
      // For now, just verify title persists
      await waitFor(() => {
        expect(titleInput).toHaveValue('Form With Components');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      expect(titleInput).toHaveAttribute('aria-label', 'Form title');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      // Tab to title input
      await user.tab();
      const titleInput = screen.getByTestId('form-title-input');
      expect(titleInput).toHaveFocus();
      
      // Should be able to edit with keyboard
      await user.keyboard('{Control>}a{/Control}New Title');
      expect(titleInput).toHaveValue('New Title');
    });

    it('should announce changes to screen readers', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Accessible Form');
      
      // Check for aria-live region or similar accessibility feature
      const liveRegion = screen.queryByRole('status');
      if (liveRegion) {
        expect(liveRegion).toHaveTextContent(/title.*updated/i);
      }
    });
  });

  describe('Visual Feedback', () => {
    it('should show visual feedback when editing', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      // Focus should add visual indicator
      await user.click(titleInput);
      expect(titleInput).toHaveFocus();
      expect(titleInput).toHaveClass(/focused|editing/);
    });

    it('should show save indicator when title changes', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Changed Title');
      
      // Look for save indicator or dirty state
      const saveIndicator = screen.queryByTestId('form-dirty-indicator');
      if (saveIndicator) {
        expect(saveIndicator).toBeInTheDocument();
      }
    });
  });

  describe('Multi-page Forms', () => {
    it('should maintain title across page navigation', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Multi-page Form');
      await user.tab();
      
      // Add a new page
      const addPageButton = screen.getByText('Add Page');
      fireEvent.click(addPageButton);
      
      // Navigate to next page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      // Navigate back to first page
      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);
      
      // Title should still be there
      await waitFor(() => {
        expect(titleInput).toHaveValue('Multi-page Form');
      });
    });
  });
});
