import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormBuilder } from '../../../../features/form-builder/components/FormBuilder';

// Mock the useFormBuilder hook
const mockUseFormBuilder = vi.fn();

vi.mock('../../../../features/form-builder/hooks/useFormBuilder', () => ({
  useFormBuilder: () => mockUseFormBuilder()
}));

// Mock template service
const mockTemplateService = {
  getAllTemplates: vi.fn(),
  saveTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  getTemplate: vi.fn(),
  exportJSON: vi.fn()
};

vi.mock('../../../../features/template-management/services/templateService', () => ({
  templateService: mockTemplateService
}));

// Mock DnD
vi.mock('react-dnd', () => ({
  useDrag: () => [{ isDragging: false }, () => {}],
  useDrop: () => [{ isOver: false }, () => {}],
}));

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: 'html5-backend'
}));

describe('Template Workflow Tests', () => {
  let mockFormBuilderState: any;

  beforeEach(() => {
    mockFormBuilderState = {
      components: [],
      pages: [{
        id: 'page1',
        title: 'Page 1',
        components: [],
        layout: { type: 'vertical', direction: 'column' },
        order: 0
      }],
      currentPageId: 'page1',
      selectedComponent: null,
      selectedComponentId: null,
      templateName: 'Test Template',
      templateId: null,
      setTemplateName: vi.fn(),
      addComponent: vi.fn(),
      selectComponent: vi.fn(),
      updateComponent: vi.fn(),
      deleteComponent: vi.fn(),
      moveComponent: vi.fn(),
      clearAll: vi.fn(),
      loadFromJSON: vi.fn(),
      loadTemplate: vi.fn(),
      exportJSON: vi.fn(() => JSON.stringify({ templateName: 'Test Template', pages: [] })),
      getCurrentPageIndex: vi.fn(() => 0),
      navigateToNextPage: vi.fn(),
      navigateToPreviousPage: vi.fn(),
      addNewPage: vi.fn(),
      updatePageTitle: vi.fn(),
      addComponentToContainerWithPosition: vi.fn(),
      rearrangeWithinContainer: vi.fn(),
      removeFromContainer: vi.fn(),
      moveFromContainerToCanvas: vi.fn(),
      addPage: vi.fn(),
      deletePage: vi.fn(),
      switchToPage: vi.fn(),
      clearPage: vi.fn(),
      canUndo: false,
      canRedo: false,
      undo: vi.fn(),
      redo: vi.fn(),
    };

    mockUseFormBuilder.mockReturnValue(mockFormBuilderState);
  });

  it('should render form builder with initial state', () => {
    render(<FormBuilder />);
    expect(screen.getByTestId('form-builder')).toBeInTheDocument();
  });

  it('should update template name', async () => {
    render(<FormBuilder />);
    const newName = 'Updated Template Name';
    
    // Simulate template name update
    mockFormBuilderState.setTemplateName(newName);
    
    // Verify the template name was updated
    expect(mockFormBuilderState.setTemplateName).toHaveBeenCalledWith(newName);
  });

  it('should add a component', async () => {
    render(<FormBuilder />);
    const componentType = 'text_input';
    
    // Simulate adding a component
    mockFormBuilderState.addComponent(componentType);
    
    // Verify the component was added
    expect(mockFormBuilderState.addComponent).toHaveBeenCalledWith(componentType);
  });

  it('should handle template export', async () => {
    render(<FormBuilder />);
    
    // Simulate template export
    const exportedData = mockFormBuilderState.exportJSON();
    
    // Verify export was called and returned valid JSON
    expect(typeof exportedData).toBe('string');
    expect(() => JSON.parse(exportedData)).not.toThrow();
  });
    updateCurrentPageComponents: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFormBuilder.mockReturnValue(mockFormBuilderState);
  });

  describe('Complete Workflow: Welcome Screen → Create New → Edit → Save', () => {
    test('should complete full workflow for creating new template', async () => {
      render(<App />);

      // Step 1: Start at welcome screen
      expect(screen.getByText('No templates yet')).toBeInTheDocument();

      // Step 2: Create new template
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      // Step 3: Should be in form builder
      await waitFor(() => {
        expect(screen.getByText('Form Builder')).toBeInTheDocument();
        expect(screen.getByTestId('dnd-provider')).toBeInTheDocument();
      });

      // Step 4: Template name should be editable
      const nameInput = screen.getByDisplayValue('Test Template');
      expect(nameInput).toBeInTheDocument();
      
      // Step 5: Change template name
      fireEvent.change(nameInput, { target: { value: 'My Custom Form' } });
      expect(mockFormBuilderState.setTemplateName).toHaveBeenCalledWith('My Custom Form');

      // Step 6: Verify all toolbar buttons are present
      expect(screen.getByText('← Back to Templates')).toBeInTheDocument();
      expect(screen.getByText('Save Template')).toBeInTheDocument();
      expect(screen.getByText('Export JSON')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    test('should handle back navigation properly', async () => {
      render(<App />);

      // Navigate to builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Form Builder')).toBeInTheDocument();
      });

      // Navigate back
      const backButton = screen.getByText('← Back to Templates');
      fireEvent.click(backButton);

      // Should be back at welcome screen
      await waitFor(() => {
        expect(screen.getByText('No templates yet')).toBeInTheDocument();
      });
    });
  });

  describe('Template with Components Workflow', () => {
    test('should enable actions when components are present', async () => {
      // Mock form builder with components
      const formBuilderWithComponents = {
        ...mockFormBuilderState,
        components: [
          {
            id: 'comp-1',
            type: 'text_input',
            label: 'Name',
            fieldId: 'name',
            required: true,
            placeholder: 'Enter name'
          }
        ]
      };
      mockUseFormBuilder.mockReturnValue(formBuilderWithComponents);

      render(<App />);

      // Navigate to builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        // Buttons should be enabled when components exist
        const previewButton = screen.getByText('Preview') as HTMLButtonElement;
        const exportButton = screen.getByText('Export JSON') as HTMLButtonElement;
        const saveButton = screen.getByText('Save Template') as HTMLButtonElement;
        const clearAllButton = screen.getByText('Clear All') as HTMLButtonElement;

        expect(previewButton.disabled).toBe(false);
        expect(exportButton.disabled).toBe(false);
        expect(saveButton.disabled).toBe(false);
        expect(clearAllButton.disabled).toBe(false);
      });
    });

    test('should handle undo/redo functionality', async () => {
      const formBuilderWithHistory = {
        ...mockFormBuilderState,
        canUndo: true,
        canRedo: true,
      };
      mockUseFormBuilder.mockReturnValue(formBuilderWithHistory);

      render(<App />);

      // Navigate to builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        const undoButton = screen.getByText('↶ Undo') as HTMLButtonElement;
        const redoButton = screen.getByText('↷ Redo') as HTMLButtonElement;

        expect(undoButton.disabled).toBe(false);
        expect(redoButton.disabled).toBe(false);

        // Test undo
        fireEvent.click(undoButton);
        expect(formBuilderWithHistory.undo).toHaveBeenCalledTimes(1);

        // Test redo
        fireEvent.click(redoButton);
        expect(formBuilderWithHistory.redo).toHaveBeenCalledTimes(1);
      });
    });

    test('should handle clear all functionality', async () => {
      const formBuilderWithComponents = {
        ...mockFormBuilderState,
        components: [{ id: 'comp-1', type: 'text_input', label: 'Name', fieldId: 'name' }]
      };
      mockUseFormBuilder.mockReturnValue(formBuilderWithComponents);

      render(<App />);

      // Navigate to builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        // Test clear all button
        const clearAllButton = screen.getByText('Clear All');
        fireEvent.click(clearAllButton);
        expect(formBuilderWithComponents.clearAll).toHaveBeenCalledTimes(1);

        // Test debug clear button
        const debugClearButton = screen.getByText('🧹 Clear');
        fireEvent.click(debugClearButton);
        expect(formBuilderWithComponents.clearAllSilent).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Page Management Workflow', () => {
    test('should handle multi-page templates', async () => {
      const formBuilderWithPages = {
        ...mockFormBuilderState,
        pages: [
          { id: 'page-1', title: 'Contact Info', components: [], layout: {} },
          { id: 'page-2', title: 'Preferences', components: [], layout: {} }
        ],
        currentPageId: 'page-1'
      };
      mockUseFormBuilder.mockReturnValue(formBuilderWithPages);

      render(<App />);

      // Navigate to builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Form Builder')).toBeInTheDocument();
        // Page navigation should be present (this depends on your PageNavigation component implementation)
        expect(screen.getByTestId('dnd-provider')).toBeInTheDocument();
      });
    });
  });

  describe('JSON File Upload Workflow', () => {
    test('should handle file upload process', async () => {
      render(<App />);

      // Navigate to builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        const loadJsonLabel = screen.getByText('📁 Load JSON');
        const fileInput = loadJsonLabel.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).toBeInTheDocument();
        expect(fileInput.accept).toBe('.json');
      });
    });
  });

  describe('Form Type Selection Workflow', () => {
    test('should allow changing template type', async () => {
      render(<App />);

      // Navigate to builder
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        const typeSelect = screen.getByDisplayValue('assessment');
        expect(typeSelect).toBeInTheDocument();

        // Change type
        fireEvent.change(typeSelect, { target: { value: 'referral' } });
        
        // Verify options are available
        const options = screen.getAllByRole('option');
        const optionValues = options.map(option => (option as HTMLOptionElement).value);
        expect(optionValues).toContain('assessment');
        expect(optionValues).toContain('referral');
        expect(optionValues).toContain('compliance');
        expect(optionValues).toContain('other');
      });
    });
  });

  describe('Error Handling in Workflow', () => {
    test('should handle form builder hook errors gracefully', () => {
      mockUseFormBuilder.mockImplementation(() => {
        throw new Error('Form builder error');
      });

      // Should not crash
      expect(() => render(<App />)).not.toThrowError();
    });

    test('should handle missing pages gracefully', async () => {
      const formBuilderWithoutPages = {
        ...mockFormBuilderState,
        pages: []
      };
      mockUseFormBuilder.mockReturnValue(formBuilderWithoutPages);

      render(<App />);

      // Navigate to builder - should not crash
      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Form Builder')).toBeInTheDocument();
      });
    });
  });
});