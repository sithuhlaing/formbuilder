import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { vi } from 'vitest';
import { FormBuilder } from '../../../features/form-builder/components/FormBuilder';

// Mock useFormBuilder hook
const mockSetTemplateName = vi.fn();

vi.mock('../../../features/form-builder/hooks/useFormBuilder', () => ({
  useFormBuilder: vi.fn(() => ({
    formState: {
      pages: [{
        id: 'page-1',
        title: 'Page 1',
        components: [],
        layout: {}
      }],
      currentPageId: 'page-1',
      templateName: 'Untitled Form'
    },
    currentComponents: [],
    selectedComponent: null,
    addComponent: vi.fn(),
    updateComponent: vi.fn(),
    deleteComponent: vi.fn(),
    selectComponent: vi.fn(),
    handleDrop: vi.fn(),
    updateProperty: vi.fn(),
    getCurrentPageIndex: vi.fn(() => 0),
    setTemplateName: mockSetTemplateName,
    onFormTitleChange: vi.fn(),
    addNewPage: vi.fn(),
    navigateToNextPage: vi.fn(),
    navigateToPreviousPage: vi.fn(),
    exportJSON: vi.fn(),
    clearAll: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false
  }))
}));

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
    vi.clearAllMocks();
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
    it('should allow focusing on title input', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      // Test that input can be focused
      await user.click(titleInput);
      expect(titleInput).toHaveFocus();
    });

    it('should call setTemplateName when user interacts with title input', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.click(titleInput);
      await user.clear(titleInput);
      await user.type(titleInput, 'Test');
      await user.tab(); // Trigger blur event
      
      // Should call setTemplateName when user interacts
      expect(mockSetTemplateName).toHaveBeenCalled();
    });

    it('should handle empty title gracefully', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.clear(titleInput);
      await user.tab(); // Blur with empty value
      
      // Should call setTemplateName even for empty title
      expect(mockSetTemplateName).toHaveBeenCalled();
    });

    it('should limit title length to reasonable maximum', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      // Check maxLength attribute
      expect(titleInput).toHaveAttribute('maxLength', '100');
    });

    it('should have proper accessibility attributes', () => {
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      expect(titleInput).toHaveAttribute('aria-label', 'Form title');
      expect(titleInput).toHaveAttribute('id', 'form-title-card');
    });
  });

  describe('Title Change Events', () => {
    it('should call setTemplateName on blur event', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.click(titleInput);
      await user.tab(); // Blur without typing
      
      // Should call setTemplateName on blur
      expect(mockSetTemplateName).toHaveBeenCalled();
    });

    it('should call setTemplateName when typing', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.click(titleInput);
      await user.type(titleInput, 'A');
      
      // Should call setTemplateName when typing (onChange fires)
      expect(mockSetTemplateName).toHaveBeenCalled();
    });
  });

  describe('Form Integration', () => {
    it('should maintain title input across page navigation', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      // Verify title input exists
      const titleInput = screen.getByTestId('form-title-input');
      expect(titleInput).toBeInTheDocument();
      
      // Add a new page - look for "+ Add Page" text
      const addPageButton = screen.getByText('+ Add Page');
      fireEvent.click(addPageButton);
      
      // Title input should still exist after page addition
      expect(screen.getByTestId('form-title-input')).toBeInTheDocument();
    });

    it('should preserve form structure when title changes', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      // Verify initial structure
      expect(screen.getByTestId('form-title-input')).toBeInTheDocument();
      expect(screen.getByText('+ Add Page')).toBeInTheDocument();
      
      const titleInput = screen.getByTestId('form-title-input');
      await user.click(titleInput);
      await user.tab();
      
      // Structure should remain intact after title interaction
      expect(screen.getByTestId('form-title-input')).toBeInTheDocument();
      expect(screen.getByText('+ Add Page')).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('should show focus state when editing', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      // Focus should be visible
      await user.click(titleInput);
      expect(titleInput).toHaveFocus();
    });

    it('should remove focus when clicking away', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      const titleInput = screen.getByTestId('form-title-input');
      
      await user.click(titleInput);
      expect(titleInput).toHaveFocus();
      
      await user.tab(); // Move focus away
      expect(titleInput).not.toHaveFocus();
    });
  });
});
