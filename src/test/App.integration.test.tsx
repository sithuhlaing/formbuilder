import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import App from '../App';
import { templateService } from '../services/templateService';
import type { FormTemplate } from '../types';

// Mock all the services and hooks
vi.mock('../services/templateService', () => ({
  templateService: {
    getTemplates: vi.fn(),
    save: vi.fn(),
    exportJSON: vi.fn(),
    exportLayoutSchema: vi.fn(),
    loadFromJSON: vi.fn(),
  }
}));

vi.mock('../hooks/useFormBuilder', () => ({
  useFormBuilder: vi.fn(() => ({
    components: [],
    selectedComponent: null,
    selectedComponentId: null,
    templateName: 'Untitled Form',
    setTemplateName: vi.fn(),
    addComponent: vi.fn(),
    selectComponent: vi.fn(),
    updateComponent: vi.fn(),
    deleteComponent: vi.fn(),
    moveComponent: vi.fn(),
    createComponent: vi.fn(),
    clearAll: vi.fn(),
    clearAllSilent: vi.fn(),
    loadFromJSON: vi.fn(),
    insertBetweenComponents: vi.fn(),
    insertHorizontalToComponent: vi.fn(),
    addComponentToContainerWithPosition: vi.fn(),
    rearrangeWithinContainer: vi.fn(),
    removeFromContainer: vi.fn(),
    moveFromContainerToCanvas: vi.fn(),
    pages: [{
      id: 'page-1',
      title: 'Page 1',
      components: [],
      layout: {}
    }],
    currentPageId: 'page-1',
    addPage: vi.fn(),
    deletePage: vi.fn(),
    updatePageTitle: vi.fn(),
    switchToPage: vi.fn(),
    clearPage: vi.fn(),
    canUndo: false,
    canRedo: false,
    undo: vi.fn(),
    redo: vi.fn(),
    updateCurrentPageComponents: vi.fn(),
  }))
}));

vi.mock('../hooks/useModals', () => ({
  useModals: vi.fn(() => ({
    notification: { isOpen: false, title: '', message: '', type: 'info' },
    confirmation: { isOpen: false, title: '', message: '', type: 'info', onConfirm: vi.fn() },
    showNotification: vi.fn(),
    showConfirmation: vi.fn(),
    closeNotification: vi.fn(),
    closeConfirmation: vi.fn(),
  }))
}));

// Mock DnD
vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: any) => <div data-testid="dnd-provider">{children}</div>,
  useDrag: () => [{ isDragging: false }, () => {}],
  useDrop: () => [{ isOver: false }, () => {}],
}));

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: 'html5-backend'
}));

// Sample test templates for integration tests
const mockTemplates: FormTemplate[] = [
  {
    templateId: 'template-1',
    name: 'Contact Form',
    type: 'assessment',
    fields: [
      {
        id: 'field-1',
        type: 'text_input',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        fieldId: 'fullName'
      },
      {
        id: 'field-2',
        type: 'email_input',
        label: 'Email Address', 
        placeholder: 'Enter your email',
        required: true,
        fieldId: 'email'
      }
    ],
    pages: [
      {
        id: 'page-1',
        title: 'Contact Information',
        components: [],
        layout: {}
      }
    ],
    createdDate: '2024-01-01T10:00:00Z',
    modifiedDate: '2024-01-02T11:00:00Z',
    jsonSchema: null,
    currentView: 'desktop'
  }
];

describe('App Integration Tests - Template Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => JSON.stringify(mockTemplates)),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true
    });
  });

  describe('Initial App Load - Welcome Screen', () => {
    test('should start on template list view by default', () => {
      (templateService.getTemplates as any).mockReturnValue([]);
      
      render(<App />);

      // Should show welcome screen when no templates
      expect(screen.getByText('No templates yet')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first form template')).toBeInTheDocument();
    });

    test('should show template list when templates exist', () => {
      (templateService.getTemplates as any).mockReturnValue(mockTemplates);
      
      render(<App />);

      expect(screen.getByText('Contact Form')).toBeInTheDocument();
      expect(screen.getByText('Form Templates')).toBeInTheDocument();
    });
  });

  describe('Create New Template Flow', () => {
    test('should transition from welcome screen to form builder when creating new template', async () => {
      (templateService.getTemplates as any).mockReturnValue([]);
      
      render(<App />);

      // Start at welcome screen
      expect(screen.getByText('No templates yet')).toBeInTheDocument();

      // Click create new template
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      // Should transition to form builder
      await waitFor(() => {
        expect(screen.getByText('Form Builder')).toBeInTheDocument(); // Header
        expect(screen.getByTestId('dnd-provider')).toBeInTheDocument(); // DnD context
      });
    });

    test('should transition from template list to form builder when creating new template', async () => {
      (templateService.getTemplates as any).mockReturnValue(mockTemplates);
      
      render(<App />);

      // Start with template list
      expect(screen.getByText('Contact Form')).toBeInTheDocument();

      // Click create new form button in header
      const createButton = screen.getByText(/create new form/i);
      fireEvent.click(createButton);

      // Should transition to form builder
      await waitFor(() => {
        expect(screen.getByTestId('dnd-provider')).toBeInTheDocument();
        expect(screen.getByText('← Back to Templates')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Template Flow', () => {
    test('should transition to form builder when editing a template', async () => {
      (templateService.getTemplates as any).mockReturnValue(mockTemplates);
      
      render(<App />);

      // Start with template list
      expect(screen.getByText('Contact Form')).toBeInTheDocument();

      // Click edit button for the first template
      const editButton = screen.getByTitle('Edit template');
      fireEvent.click(editButton);

      // Should transition to form builder
      await waitFor(() => {
        expect(screen.getByTestId('dnd-provider')).toBeInTheDocument();
        expect(screen.getByText('← Back to Templates')).toBeInTheDocument();
        expect(screen.getByText('Form Builder')).toBeInTheDocument();
      });
    });
  });

  describe('Form Builder View', () => {
    test('should show all form builder components when in builder view', async () => {
      (templateService.getTemplates as any).mockReturnValue([]);
      
      render(<App />);

      // Navigate to form builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        // Check header toolbar
        expect(screen.getByText('← Back to Templates')).toBeInTheDocument();
        expect(screen.getByText('🧹 Clear')).toBeInTheDocument();
        expect(screen.getByText('↶ Undo')).toBeInTheDocument();
        expect(screen.getByText('↷ Redo')).toBeInTheDocument();
        expect(screen.getByText('📁 Load JSON')).toBeInTheDocument();
        expect(screen.getByText('Clear All')).toBeInTheDocument();
        expect(screen.getByText('Preview')).toBeInTheDocument();
        expect(screen.getByText('Export JSON')).toBeInTheDocument();
        expect(screen.getByText('Export Schema')).toBeInTheDocument();
        expect(screen.getByText('Save Template')).toBeInTheDocument();

        // Check main layout sections
        expect(screen.getByTestId('dnd-provider')).toBeInTheDocument();
      });
    });

    test('should have back to templates functionality', async () => {
      (templateService.getTemplates as any).mockReturnValue(mockTemplates);
      
      render(<App />);

      // Navigate to form builder
      const createButton = screen.getByText(/create new form/i);
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('← Back to Templates')).toBeInTheDocument();
      });

      // Click back to templates
      const backButton = screen.getByText('← Back to Templates');
      fireEvent.click(backButton);

      // Should return to template list
      await waitFor(() => {
        expect(screen.getByText('Contact Form')).toBeInTheDocument();
        expect(screen.queryByTestId('dnd-provider')).not.toBeInTheDocument();
      });
    });
  });

  describe('Template Actions in Builder', () => {
    test('should show disabled state for buttons when no components', async () => {
      (templateService.getTemplates as any).mockReturnValue([]);
      
      render(<App />);

      // Navigate to form builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        // These buttons should be disabled when no components
        const previewButton = screen.getByText('Preview');
        const exportButton = screen.getByText('Export JSON');
        const saveButton = screen.getByText('Save Template');
        const clearAllButton = screen.getByText('Clear All');

        expect(previewButton).toBeDisabled();
        expect(exportButton).toBeDisabled(); 
        expect(saveButton).toBeDisabled();
        expect(clearAllButton).toBeDisabled();
      });
    });

    test('should have template name input field', async () => {
      (templateService.getTemplates as any).mockReturnValue([]);
      
      render(<App />);

      // Navigate to form builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Form Name');
        expect(nameInput).toBeInTheDocument();
        expect(nameInput).toHaveValue('Untitled Form');
      });
    });

    test('should have template type selector', async () => {
      (templateService.getTemplates as any).mockReturnValue([]);
      
      render(<App />);

      // Navigate to form builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        const typeSelector = screen.getByDisplayValue('assessment');
        expect(typeSelector).toBeInTheDocument();
        
        // Check all options are available
        expect(screen.getByText('Assessment')).toBeInTheDocument();
        expect(screen.getByText('Referral')).toBeInTheDocument();
        expect(screen.getByText('Compliance')).toBeInTheDocument();
        expect(screen.getByText('Other')).toBeInTheDocument();
      });
    });
  });

  describe('File Upload Integration', () => {
    test('should have JSON file upload functionality', async () => {
      (templateService.getTemplates as any).mockReturnValue([]);
      
      render(<App />);

      // Navigate to form builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        const loadJsonButton = screen.getByText('📁 Load JSON');
        expect(loadJsonButton).toBeInTheDocument();
        
        // Check if it has a hidden file input
        const fileInput = loadJsonButton.querySelector('input[type="file"]');
        expect(fileInput).toBeInTheDocument();
        expect(fileInput).toHaveAttribute('accept', '.json');
      });
    });
  });

  describe('Modal Integration', () => {
    test('should show preview modal when preview button is clicked from template list', async () => {
      (templateService.getTemplates as any).mockReturnValue(mockTemplates);
      
      render(<App />);

      // Click preview button
      const previewButton = screen.getByTitle('Preview template');
      fireEvent.click(previewButton);

      // Preview modal should open (mocked)
      await waitFor(() => {
        expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Integration', () => {
    test('should save templates to localStorage when editing', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      
      render(<App />);

      // LocalStorage should be called during app initialization
      expect(setItemSpy).toHaveBeenCalledWith(
        'formTemplates', 
        expect.any(String)
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle missing template data gracefully', () => {
      (templateService.getTemplates as any).mockReturnValue([{
        templateId: 'broken-template',
        name: 'Broken Template',
        type: 'assessment',
        fields: null, // Broken data
        pages: undefined, // Missing data
        createdDate: '2024-01-01T10:00:00Z',
        modifiedDate: '2024-01-01T10:00:00Z',
        jsonSchema: null,
        currentView: 'desktop'
      }]);
      
      // Should not crash
      expect(() => render(<App />)).not.toThrow();
    });

    test('should handle templateService errors gracefully', () => {
      (templateService.getTemplates as any).mockImplementation(() => {
        throw new Error('Service error');
      });
      
      // Should not crash the app
      expect(() => render(<App />)).not.toThrow();
    });
  });
});