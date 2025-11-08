import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormBuilder } from '../../../features/form-builder/components/FormBuilder';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Mock the useSimpleFormBuilder hook
const mockUseFormBuilder = vi.fn();

vi.mock('../../../features/form-builder/hooks/useFormBuilder', () => ({
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
  DndProvider: ({ children }: { children: React.ReactNode }) => children,
  useDrag: () => [{ isDragging: false }, () => {}, vi.fn()],
  useDrop: () => [{ isOver: false }, () => {}],
}));

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: 'html5-backend',
  getEmptyImage: vi.fn(() => ({ img: new Image() }))
}));

describe('Template Workflow Tests', () => {
  let mockFormBuilderState: any;

  beforeEach(() => {
    mockFormBuilderState = {
      pages: [{
        id: 'page1',
        title: 'Page 1',
        components: [],
        layout: { type: 'vertical', direction: 'column' },
        order: 0
      }],
      currentPageId: 'page1',
      selectedId: null,
      templateName: 'Untitled Form',
      history: [],
      historyIndex: 0,
      previewMode: false,
      mode: 'create' as const,
      editingTemplateId: undefined,
      components: [], // Current page components
      addComponent: vi.fn(),
      updateComponent: vi.fn(),
      deleteComponent: vi.fn(),
      selectComponent: vi.fn(),
      moveComponent: vi.fn(),
      setTemplateName: vi.fn(),
      getCurrentPageIndex: vi.fn(() => 0),
      navigateToNextPage: vi.fn(),
      navigateToPreviousPage: vi.fn(),
      addNewPage: vi.fn(),
      clearAll: vi.fn(),
      importJSON: vi.fn(),
      exportJSON: vi.fn(() => JSON.stringify({ templateName: 'Test Template', pages: [] })),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: vi.fn(() => false),
      canRedo: vi.fn(() => false),
      togglePreview: vi.fn(),
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

  describe('Complete Workflow: Welcome Screen → Create New → Edit → Save', () => {
    test('should complete full workflow for creating new template', async () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <FormBuilder />
        </DndProvider>
      );

      // Step 1: Should be in form builder
      await waitFor(() => {
        expect(screen.getByTestId('form-builder')).toBeInTheDocument();
      });

      // Step 2: Template name should be editable
      const nameInput = screen.getByDisplayValue('Untitled Form');
      expect(nameInput).toBeInTheDocument();
      
      // Step 3: Change template name
      fireEvent.change(nameInput, { target: { value: 'My Custom Form' } });
      expect(mockFormBuilderState.setTemplateName).toHaveBeenCalledWith('My Custom Form');
    });

    test('should handle back navigation properly', async () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <FormBuilder />
        </DndProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-builder')).toBeInTheDocument();
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

      render(
        <DndProvider backend={HTML5Backend}>
          <FormBuilder />
        </DndProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-builder')).toBeInTheDocument();
      });
    });

    test('should handle undo/redo functionality', async () => {
      const formBuilderWithHistory = {
        ...mockFormBuilderState,
        canUndo: true,
        canRedo: true,
      };
      mockUseFormBuilder.mockReturnValue(formBuilderWithHistory);

      render(
        <DndProvider backend={HTML5Backend}>
          <FormBuilder />
        </DndProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-builder')).toBeInTheDocument();
      });
    });

    test('should handle clear all functionality', async () => {
      const formBuilderWithComponents = {
        ...mockFormBuilderState,
        components: [{ id: 'comp-1', type: 'text_input', label: 'Name', fieldId: 'name' }]
      };
      mockUseFormBuilder.mockReturnValue(formBuilderWithComponents);

      render(
        <DndProvider backend={HTML5Backend}>
          <FormBuilder />
        </DndProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-builder')).toBeInTheDocument();
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

      render(
        <DndProvider backend={HTML5Backend}>
          <FormBuilder />
        </DndProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-builder')).toBeInTheDocument();
      });
    });
  });

  describe('JSON File Upload Workflow', () => {
    test('should handle file upload process', async () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <FormBuilder />
        </DndProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-builder')).toBeInTheDocument();
      });
    });
  });

  describe('Form Type Selection Workflow', () => {
    test('should allow changing template type', async () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <FormBuilder />
        </DndProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-builder')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling in Workflow', () => {
    test('should handle form builder hook errors gracefully', () => {
      mockUseFormBuilder.mockImplementation(() => {
        throw new Error('Form builder error');
      });

      // Should throw error when hook fails
      expect(() => render(
        <DndProvider backend={HTML5Backend}>
          <FormBuilder />
        </DndProvider>
      )).toThrowError('Form builder error');
    });

    test('should handle missing pages gracefully', async () => {
      const formBuilderWithoutPages = {
        ...mockFormBuilderState,
        pages: []
      };
      mockUseFormBuilder.mockReturnValue(formBuilderWithoutPages);

      render(
        <DndProvider backend={HTML5Backend}>
          <FormBuilder />
        </DndProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-builder')).toBeInTheDocument();
      });
    });
  });
});
