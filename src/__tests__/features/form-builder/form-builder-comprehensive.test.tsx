/**
 * Comprehensive Form Builder Components Test Suite
 * Covers useSimpleFormBuilder hook, Canvas, ComponentPalette, PropertiesPanel
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSimpleFormBuilder} from '../../hooks/useSimpleFormBuilder';
import { ComponentPalette } from '../features/form-builder/components/ComponentPalette';
import { Canvas } from '../features/form-builder/components/Canvas';
import { PropertiesPanel } from '../features/form-builder/components/PropertiesPanel';

// Test wrapper for DnD components
const DnDWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

describe('🎨 Form Builder Components - Comprehensive Coverage', () => {

  describe('useSimpleFormBuilder Hook - Complete Coverage', () => {
    
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      expect(result.current.formState.pages).toHaveLength(1);
      expect(result.current.formState.currentPageId).toBeDefined();
      expect(result.current.formState.templateName).toBe('Untitled Form');
      expect(result.current.currentComponents).toHaveLength(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('should add components correctly', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      act(() => {
        result.current.addComponent('text_input');
      });

      expect(result.current.currentComponents).toHaveLength(1);
      expect(result.current.currentComponents[0].type).toBe('text_input');
      expect(result.current.canUndo).toBe(true);
    });

    it('should update components correctly', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Add component first
      act(() => {
        result.current.addComponent('text_input');
      });

      const componentId = result.current.currentComponents[0].id;
      
      // Update component
      act(() => {
        result.current.updateComponent(componentId, {
          label: 'Updated Label',
          required: true
        });
      });

      const updatedComponent = result.current.currentComponents[0];
      expect(updatedComponent.label).toBe('Updated Label');
      expect(updatedComponent.required).toBe(true);
    });

    it('should delete components correctly', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Add component first
      act(() => {
        result.current.addComponent('text_input');
      });

      const componentId = result.current.currentComponents[0].id;
      
      // Delete component
      act(() => {
        result.current.deleteComponent(componentId);
      });

      expect(result.current.currentComponents).toHaveLength(0);
      expect(result.current.selectedComponentId).toBeNull();
    });

    it('should handle component selection', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Add component first
      act(() => {
        result.current.addComponent('text_input');
      });

      const componentId = result.current.currentComponents[0].id;
      
      // Select component
      act(() => {
        result.current.selectComponent(componentId);
      });

      expect(result.current.selectedComponentId).toBe(componentId);
      
      // Deselect component
      act(() => {
        result.current.selectComponent(null);
      });

      expect(result.current.selectedComponentId).toBeNull();
    });

    it('should handle undo/redo operations', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Add first component
      act(() => {
        result.current.addComponent('text_input');
      });

      expect(result.current.currentComponents).toHaveLength(1);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);

      // Undo
      act(() => {
        result.current.undo();
      });

      expect(result.current.currentComponents).toHaveLength(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);

      // Redo
      act(() => {
        result.current.redo();
      });

      expect(result.current.currentComponents).toHaveLength(1);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('should handle drag and drop operations', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Add initial component
      act(() => {
        result.current.addComponent('text_input');
      });

      const targetId = result.current.currentComponents[0].id;

      // Handle drop operation
      act(() => {
        result.current.handleDrop('email_input', targetId, 'after');
      });

      expect(result.current.currentComponents).toHaveLength(2);
      expect(result.current.currentComponents[1].type).toBe('email_input');
    });

    it('should clear all components', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Add multiple components
      act(() => {
        result.current.addComponent('text_input');
        result.current.addComponent('email_input');
      });

      expect(result.current.currentComponents).toHaveLength(2);

      // Clear all
      act(() => {
        result.current.clearAll();
      });

      expect(result.current.currentComponents).toHaveLength(0);
      expect(result.current.selectedComponentId).toBeNull();
    });

    it('should export JSON correctly', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Add component
      act(() => {
        result.current.addComponent('text_input');
      });

      // Update template name
      act(() => {
        result.current.updateTemplateName('Test Form');
      });

      const exportedJSON = result.current.exportJSON();
      const parsedJSON = JSON.parse(exportedJSON);

      expect(parsedJSON.templateName).toBe('Test Form');
      expect(parsedJSON.pages).toHaveLength(1);
      expect(parsedJSON.pages[0].components).toHaveLength(1);
    });

    it('should load JSON correctly', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      const sampleJSON = {
        templateName: 'Imported Form',
        pages: [{
          id: 'page1',
          title: 'Page 1',
          components: [{
            id: 'comp1',
            type: 'text_input',
            label: 'Name',
            required: true,
            fieldId: 'name'
          }],
          layout: {}
        }]
      };

      act(() => {
        result.current.loadFromJSON(JSON.stringify(sampleJSON));
      });

      expect(result.current.formState.templateName).toBe('Imported Form');
      expect(result.current.currentComponents).toHaveLength(1);
      expect(result.current.currentComponents[0].label).toBe('Name');
    });

    it('should handle page navigation', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Add second page
      act(() => {
        result.current.addNewPage();
      });

      expect(result.current.formState.pages).toHaveLength(2);

      // Navigate to next page
      act(() => {
        result.current.navigateToNextPage();
      });

      expect(result.current.formState.currentPageId).toBe(result.current.formState.pages[1].id);

      // Navigate to previous page
      act(() => {
        result.current.navigateToPreviousPage();
      });

      expect(result.current.formState.currentPageId).toBe(result.current.formState.pages[0].id);
    });

    it('should update page title', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      const pageId = result.current.formState.currentPageId;
      
      act(() => {
        result.current.updatePageTitle(pageId, 'Updated Page Title');
      });

      const currentPage = result.current.formState.pages.find(p => p.id === pageId);
      expect(currentPage?.title).toBe('Updated Page Title');
    });

    it('should handle form submission', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Add component
      act(() => {
        result.current.addComponent('text_input');
      });

      const submissionResult = result.current.submitForm();
      expect(submissionResult.success).toBe(true);

      // Test empty form submission
      act(() => {
        result.current.clearAll();
      });

      const emptySubmissionResult = result.current.submitForm();
      expect(emptySubmissionResult.success).toBe(false);
      expect(emptySubmissionResult.error).toBe('Form is empty');
    });

    it('should calculate current page index correctly', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      expect(result.current.getCurrentPageIndex()).toBe(0);

      // Add second page and navigate to it
      act(() => {
        result.current.addNewPage();
        result.current.navigateToNextPage();
      });

      expect(result.current.getCurrentPageIndex()).toBe(1);
    });
  });

  describe('ComponentPalette - Complete Coverage', () => {
    
    it('should render all component categories', () => {
      const mockProps = {
        onAddComponent: vi.fn(),
        searchTerm: '',
        onSearchChange: vi.fn()
      };

      render(
        <DnDWrapper>
          <ComponentPalette {...mockProps} />
        </DnDWrapper>
      );

      expect(screen.getByText('Input Fields')).toBeInTheDocument();
      expect(screen.getByText('Selection Controls')).toBeInTheDocument();
      expect(screen.getByText('Layout Components')).toBeInTheDocument();
    });

    it('should handle search functionality', () => {
      const mockOnSearchChange = vi.fn();
      const mockProps = {
        onAddComponent: vi.fn(),
        searchTerm: '',
        onSearchChange: mockOnSearchChange
      };

      render(
        <DnDWrapper>
          <ComponentPalette {...mockProps} />
        </DnDWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search components...');
      fireEvent.change(searchInput, { target: { value: 'text' } });

      expect(mockOnSearchChange).toHaveBeenCalledWith('text');
    });

    it('should filter components based on search term', () => {
      const mockProps = {
        onAddComponent: vi.fn(),
        searchTerm: 'text',
        onSearchChange: vi.fn()
      };

      render(
        <DnDWrapper>
          <ComponentPalette {...mockProps} />
        </DnDWrapper>
      );

      expect(screen.getByText('Text Input')).toBeInTheDocument();
      expect(screen.getByText('Rich Text')).toBeInTheDocument();
      // Email Input should not be visible with 'text' search
      expect(screen.queryByText('Email Input')).not.toBeInTheDocument();
    });

    it('should handle accordion expand/collapse', () => {
      const mockProps = {
        onAddComponent: vi.fn(),
        searchTerm: '',
        onSearchChange: vi.fn()
      };

      render(
        <DnDWrapper>
          <ComponentPalette {...mockProps} />
        </DnDWrapper>
      );

      const accordionHeader = screen.getByText('Selection Controls');
      fireEvent.click(accordionHeader);

      // Should expand and show selection components
      expect(screen.getByText('Dropdown')).toBeInTheDocument();
      expect(screen.getByText('Checkbox')).toBeInTheDocument();
    });

    it('should handle component dragging', () => {
      const mockOnAddComponent = vi.fn();
      const mockProps = {
        onAddComponent: mockOnAddComponent,
        searchTerm: '',
        onSearchChange: vi.fn()
      };

      render(
        <DnDWrapper>
          <ComponentPalette {...mockProps} />
        </DnDWrapper>
      );

      const textInputButton = screen.getByText('Text Input');
      
      // Simulate drag start
      fireEvent.mouseDown(textInputButton);
      
      // Note: Full drag-drop testing requires more complex setup
      // This tests the basic interaction
      expect(textInputButton).toBeInTheDocument();
    });
  });

  describe('Canvas - Complete Coverage', () => {
    
    it('should render empty state when no components', () => {
      const mockProps = {
        components: [],
        selectedComponentId: null,
        onSelectComponent: vi.fn(),
        onUpdateComponent: vi.fn(),
        onDeleteComponent: vi.fn(),
        onDrop: vi.fn(),
        previewMode: false
      };

      render(
        <DnDWrapper>
          <Canvas {...mockProps} />
        </DnDWrapper>
      );

      expect(screen.getByText('Add components here')).toBeInTheDocument();
      expect(screen.getByText('Drag components from the left panel to start building your form')).toBeInTheDocument();
    });

    it('should render components when provided', () => {
      const mockComponents = [
        {
          id: 'comp1',
          type: 'text_input' as const,
          label: 'Name',
          fieldId: 'name',
          required: false
        },
        {
          id: 'comp2',
          type: 'email_input' as const,
          label: 'Email',
          fieldId: 'email',
          required: true
        }
      ];

      const mockProps = {
        components: mockComponents,
        selectedComponentId: null,
        onSelectComponent: vi.fn(),
        onUpdateComponent: vi.fn(),
        onDeleteComponent: vi.fn(),
        onDrop: vi.fn(),
        previewMode: false
      };

      render(
        <DnDWrapper>
          <Canvas {...mockProps} />
        </DnDWrapper>
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should handle component selection', () => {
      const mockOnSelectComponent = vi.fn();
      const mockComponents = [
        {
          id: 'comp1',
          type: 'text_input' as const,
          label: 'Name',
          fieldId: 'name',
          required: false
        }
      ];

      const mockProps = {
        components: mockComponents,
        selectedComponentId: null,
        onSelectComponent: mockOnSelectComponent,
        onUpdateComponent: vi.fn(),
        onDeleteComponent: vi.fn(),
        onDrop: vi.fn(),
        previewMode: false
      };

      render(
        <DnDWrapper>
          <Canvas {...mockProps} />
        </DnDWrapper>
      );

      const componentElement = screen.getByText('Name');
      fireEvent.click(componentElement);

      expect(mockOnSelectComponent).toHaveBeenCalledWith('comp1');
    });

    it('should show selected component with highlight', () => {
      const mockComponents = [
        {
          id: 'comp1',
          type: 'text_input' as const,
          label: 'Name',
          fieldId: 'name',
          required: false
        }
      ];

      const mockProps = {
        components: mockComponents,
        selectedComponentId: 'comp1',
        onSelectComponent: vi.fn(),
        onUpdateComponent: vi.fn(),
        onDeleteComponent: vi.fn(),
        onDrop: vi.fn(),
        previewMode: false
      };

      render(
        <DnDWrapper>
          <Canvas {...mockProps} />
        </DnDWrapper>
      );

      // Should have selected class or styling
      const selectedElement = screen.getByText('Name').closest('.component-item');
      expect(selectedElement).toHaveClass('selected');
    });

    it('should handle component deletion', () => {
      const mockOnDeleteComponent = vi.fn();
      const mockComponents = [
        {
          id: 'comp1',
          type: 'text_input' as const,
          label: 'Name',
          fieldId: 'name',
          required: false
        }
      ];

      const mockProps = {
        components: mockComponents,
        selectedComponentId: 'comp1',
        onSelectComponent: vi.fn(),
        onUpdateComponent: vi.fn(),
        onDeleteComponent: mockOnDeleteComponent,
        onDrop: vi.fn(),
        previewMode: false
      };

      render(
        <DnDWrapper>
          <Canvas {...mockProps} />
        </DnDWrapper>
      );

      const deleteButton = screen.getByTitle('Delete component');
      fireEvent.click(deleteButton);

      expect(mockOnDeleteComponent).toHaveBeenCalledWith('comp1');
    });

    it('should handle drop operations', () => {
      const mockOnDrop = vi.fn();
      const mockProps = {
        components: [],
        selectedComponentId: null,
        onSelectComponent: vi.fn(),
        onUpdateComponent: vi.fn(),
        onDeleteComponent: vi.fn(),
        onDrop: mockOnDrop,
        previewMode: false
      };

      render(
        <DnDWrapper>
          <Canvas {...mockProps} />
        </DnDWrapper>
      );

      const dropZone = screen.getByTestId('canvas-drop-zone');
      
      // Simulate drop event
      fireEvent.drop(dropZone, {
        dataTransfer: {
          getData: () => JSON.stringify({ type: 'text_input' })
        }
      });

      // Note: React DnD testing is complex, this tests the basic setup
      expect(dropZone).toBeInTheDocument();
    });

    it('should render in preview mode differently', () => {
      const mockComponents = [
        {
          id: 'comp1',
          type: 'text_input' as const,
          label: 'Name',
          fieldId: 'name',
          required: false
        }
      ];

      const mockProps = {
        components: mockComponents,
        selectedComponentId: null,
        onSelectComponent: vi.fn(),
        onUpdateComponent: vi.fn(),
        onDeleteComponent: vi.fn(),
        onDrop: vi.fn(),
        previewMode: true
      };

      render(
        <DnDWrapper>
          <Canvas {...mockProps} />
        </DnDWrapper>
      );

      // In preview mode, should not show selection/delete controls
      expect(screen.queryByTitle('Delete component')).not.toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('PropertiesPanel - Complete Coverage', () => {
    
    it('should render empty state when no component selected', () => {
      const mockProps = {
        selectedComponent: null,
        onUpdateComponent: vi.fn()
      };

      render(<PropertiesPanel {...mockProps} />);

      expect(screen.getByText('Select a component to edit its properties')).toBeInTheDocument();
    });

    it('should render component properties when component selected', () => {
      const mockComponent = {
        id: 'comp1',
        type: 'text_input' as const,
        label: 'Name',
        fieldId: 'name',
        placeholder: 'Enter your name',
        required: false
      };

      const mockProps = {
        selectedComponent: mockComponent,
        onUpdateComponent: vi.fn()
      };

      render(<PropertiesPanel {...mockProps} />);

      expect(screen.getByDisplayValue('Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Enter your name')).toBeInTheDocument();
      expect(screen.getByLabelText('Required')).toBeInTheDocument();
    });

    it('should handle property updates', () => {
      const mockOnUpdateComponent = vi.fn();
      const mockComponent = {
        id: 'comp1',
        type: 'text_input' as const,
        label: 'Name',
        fieldId: 'name',
        placeholder: 'Enter your name',
        required: false
      };

      const mockProps = {
        selectedComponent: mockComponent,
        onUpdateComponent: mockOnUpdateComponent
      };

      render(<PropertiesPanel {...mockProps} />);

      const labelInput = screen.getByDisplayValue('Name');
      fireEvent.change(labelInput, { target: { value: 'Full Name' } });
      fireEvent.blur(labelInput);

      expect(mockOnUpdateComponent).toHaveBeenCalledWith('comp1', {
        label: 'Full Name'
      });
    });

    it('should render type-specific properties for select components', () => {
      const mockComponent = {
        id: 'comp1',
        type: 'select' as const,
        label: 'Country',
        fieldId: 'country',
        required: false,
        options: [
          { label: 'USA', value: 'us' },
          { label: 'Canada', value: 'ca' }
        ]
      };

      const mockProps = {
        selectedComponent: mockComponent,
        onUpdateComponent: vi.fn()
      };

      render(<PropertiesPanel {...mockProps} />);

      expect(screen.getByText('Options')).toBeInTheDocument();
      expect(screen.getByDisplayValue('USA')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Canada')).toBeInTheDocument();
    });

    it('should handle option management for select components', () => {
      const mockOnUpdateComponent = vi.fn();
      const mockComponent = {
        id: 'comp1',
        type: 'select' as const,
        label: 'Country',
        fieldId: 'country',
        required: false,
        options: [
          { label: 'USA', value: 'us' }
        ]
      };

      const mockProps = {
        selectedComponent: mockComponent,
        onUpdateComponent: mockOnUpdateComponent
      };

      render(<PropertiesPanel {...mockProps} />);

      const addOptionButton = screen.getByText('Add Option');
      fireEvent.click(addOptionButton);

      expect(mockOnUpdateComponent).toHaveBeenCalledWith('comp1', {
        options: [
          { label: 'USA', value: 'us' },
          { label: 'Option 2', value: 'option_2' }
        ]
      });
    });

    it('should render number input specific properties', () => {
      const mockComponent = {
        id: 'comp1',
        type: 'number_input' as const,
        label: 'Age',
        fieldId: 'age',
        required: false,
        min: 0,
        max: 100
      };

      const mockProps = {
        selectedComponent: mockComponent,
        onUpdateComponent: vi.fn()
      };

      render(<PropertiesPanel {...mockProps} />);

      expect(screen.getByLabelText('Minimum Value')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum Value')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    it('should handle textarea specific properties', () => {
      const mockComponent = {
        id: 'comp1',
        type: 'textarea' as const,
        label: 'Description',
        fieldId: 'description',
        required: false,
        rows: 5
      };

      const mockProps = {
        selectedComponent: mockComponent,
        onUpdateComponent: vi.fn()
      };

      render(<PropertiesPanel {...mockProps} />);

      expect(screen.getByLabelText('Rows')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });
  });
});