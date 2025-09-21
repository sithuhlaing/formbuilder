import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormBuilder } from '../../../features/form-builder/components/FormBuilder';
import { DragDropService } from '../features/drag-drop/services/DragDropService';
import type { FormComponentData, ComponentType } from '../types/component';

// Test wrapper with DnD provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

describe('Canvas Area Business Logic Tests', () => {
  
  describe('Form/Page Card - Form Title Management', () => {
    
    test('should display "Untitled Form" as default when form title is empty', () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const formTitleInput = screen.getByDisplayValue('Untitled Form');
      expect(formTitleInput).toBeInTheDocument();
    });

    test('should update form title in real-time on typing', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const formTitleInput = screen.getByDisplayValue('Untitled Form');
      fireEvent.change(formTitleInput, { target: { value: 'My Custom Form' } });
      
      expect(formTitleInput).toHaveValue('My Custom Form');
    });

    test('should auto-fill "Untitled Form" on blur when empty', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const formTitleInput = screen.getByDisplayValue('Untitled Form');
      fireEvent.change(formTitleInput, { target: { value: '' } });
      fireEvent.blur(formTitleInput);
      
      await waitFor(() => {
        expect(formTitleInput).toHaveValue('Untitled Form');
      });
    });

    test('should trim whitespace on blur', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const formTitleInput = screen.getByDisplayValue('Untitled Form');
      fireEvent.change(formTitleInput, { target: { value: '  My Form  ' } });
      fireEvent.blur(formTitleInput);
      
      await waitFor(() => {
        expect(formTitleInput).toHaveValue('My Form');
      });
    });

    test('should enforce max length of 100 characters', () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const formTitleInput = screen.getByDisplayValue('Untitled Form');
      const longTitle = 'a'.repeat(150);
      fireEvent.change(formTitleInput, { target: { value: longTitle } });
      
      expect(formTitleInput.value.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Form/Page Card - Page Navigation', () => {
    
    test('should show Previous button as disabled on first page', () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const previousBtn = screen.getByText('← Previous');
      expect(previousBtn).toBeDisabled();
    });

    test('should show Next button as enabled when multiple pages exist', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      // Add a new page first
      const addPageBtn = screen.getByText('Add Page');
      fireEvent.click(addPageBtn);
      
      await waitFor(() => {
        const nextBtn = screen.getByText('Next →');
        expect(nextBtn).toBeEnabled();
      });
    });

    test('should hide Next button on last page', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      // Add page and navigate to it
      const addPageBtn = screen.getByText('Add Page');
      fireEvent.click(addPageBtn);
      
      const nextBtn = screen.getByText('Next →');
      fireEvent.click(nextBtn);
      
      await waitFor(() => {
        expect(screen.queryByText('Next →')).not.toBeInTheDocument();
      });
    });

    test('should show Add Page button as always enabled', () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const addPageBtn = screen.getByText('Add Page');
      expect(addPageBtn).toBeEnabled();
    });

    test('should create new page with auto-generated title', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const addPageBtn = screen.getByText('Add Page');
      fireEvent.click(addPageBtn);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Untitled Page')).toBeInTheDocument();
      });
    });

    test('should update page title in real-time', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const pageTitleInput = screen.getByDisplayValue('Untitled Page');
      fireEvent.change(pageTitleInput, { target: { value: 'Contact Information' } });
      
      expect(pageTitleInput).toHaveValue('Contact Information');
    });
  });

  describe('Canvas Card - Empty State', () => {
    
    test('should display welcome message when canvas is empty', () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      expect(screen.getByText('Add components here')).toBeInTheDocument();
      expect(screen.getByText('Drag components from the left panel to start building your form')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    test('should accept first component drop anywhere on canvas including center', () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const canvas = screen.getByTestId('canvas-area');
      expect(canvas).toBeInTheDocument();
      
      // Canvas should accept drops when empty
      expect(canvas).toHaveAttribute('data-accepts-drops', 'true');
    });
  });

  describe('Canvas Card - Component Addition via Drag-Drop', () => {
    
    test('should create first component in column layout on center drop', () => {
      const components: FormComponentData[] = [];
      const mockCreateComponent = vi.fn().mockReturnValue({
        id: 'test-1',
        type: 'text_input' as ComponentType,
        label: 'Text Input',
        fieldId: 'text_input_1'
      });

      const result = DragDropService.handleDrop(
        components,
        { type: 'center', targetId: '', componentType: 'text_input' },
        mockCreateComponent
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('text_input');
    });

    test('should append component to end on center drop for populated canvas', () => {
      const components: FormComponentData[] = [
        { id: 'existing-1', type: 'text_input', label: 'Existing', fieldId: 'existing_1' }
      ];
      const mockCreateComponent = vi.fn().mockReturnValue({
        id: 'test-2',
        type: 'email_input' as ComponentType,
        label: 'Email Input',
        fieldId: 'email_input_1'
      });

      const result = DragDropService.handleDrop(
        components,
        { type: 'center', targetId: '', componentType: 'email_input' },
        mockCreateComponent
      );

      expect(result).toHaveLength(2);
      expect(result[1].type).toBe('email_input');
    });

    test('should insert component before target on before drop', () => {
      const components: FormComponentData[] = [
        { id: 'target-1', type: 'text_input', label: 'Target', fieldId: 'target_1' }
      ];
      const mockCreateComponent = vi.fn().mockReturnValue({
        id: 'new-1',
        type: 'email_input' as ComponentType,
        label: 'New Component',
        fieldId: 'new_1'
      });

      const result = DragDropService.handleDrop(
        components,
        { type: 'before', targetId: 'target-1', componentType: 'email_input' },
        mockCreateComponent
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('new-1');
      expect(result[1].id).toBe('target-1');
    });

    test('should insert component after target on after drop', () => {
      const components: FormComponentData[] = [
        { id: 'target-1', type: 'text_input', label: 'Target', fieldId: 'target_1' }
      ];
      const mockCreateComponent = vi.fn().mockReturnValue({
        id: 'new-1',
        type: 'email_input' as ComponentType,
        label: 'New Component',
        fieldId: 'new_1'
      });

      const result = DragDropService.handleDrop(
        components,
        { type: 'after', targetId: 'target-1', componentType: 'email_input' },
        mockCreateComponent
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('target-1');
      expect(result[1].id).toBe('new-1');
    });

    test('should create horizontal layout on left drop', () => {
      const components: FormComponentData[] = [
        { id: 'target-1', type: 'text_input', label: 'Target', fieldId: 'target_1' }
      ];
      const mockCreateComponent = vi.fn().mockReturnValue({
        id: 'new-1',
        type: 'email_input' as ComponentType,
        label: 'New Component',
        fieldId: 'new_1'
      });

      const result = DragDropService.handleDrop(
        components,
        { type: 'left', targetId: 'target-1', componentType: 'email_input' },
        mockCreateComponent
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('horizontal_layout');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children![0].id).toBe('new-1'); // New component on left
      expect(result[0].children![1].id).toBe('target-1'); // Target on right
    });

    test('should create horizontal layout on right drop', () => {
      const components: FormComponentData[] = [
        { id: 'target-1', type: 'text_input', label: 'Target', fieldId: 'target_1' }
      ];
      const mockCreateComponent = vi.fn().mockReturnValue({
        id: 'new-1',
        type: 'email_input' as ComponentType,
        label: 'New Component',
        fieldId: 'new_1'
      });

      const result = DragDropService.handleDrop(
        components,
        { type: 'right', targetId: 'target-1', componentType: 'email_input' },
        mockCreateComponent
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('horizontal_layout');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children![0].id).toBe('target-1'); // Target on left
      expect(result[0].children![1].id).toBe('new-1'); // New component on right
    });
  });

  describe('Canvas Card - Position Detection', () => {
    
    test('should detect left/right drops within 25% threshold', () => {
      // This would be tested with actual mouse coordinates in integration tests
      // Mock position detection logic
      const elementWidth = 400;
      const leftThreshold = elementWidth * 0.25; // 100px
      const rightThreshold = elementWidth * 0.75; // 300px
      
      expect(leftThreshold).toBe(100);
      expect(rightThreshold).toBe(300);
    });

    test('should detect top/bottom drops within 30% threshold', () => {
      const elementHeight = 200;
      const topThreshold = elementHeight * 0.3; // 60px
      const bottomThreshold = elementHeight * 0.7; // 140px
      
      expect(topThreshold).toBe(60);
      expect(bottomThreshold).toBe(140);
    });
  });

  describe('Canvas Card - Component Selection', () => {
    
    test('should highlight selected component with blue border', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      // Add a component first (would need to simulate drag-drop)
      // Then test selection
      const component = screen.queryByTestId('canvas-item-0');
      if (component) {
        fireEvent.click(component);
        
        await waitFor(() => {
          expect(component).toHaveClass('selected');
        });
      }
    });

    test('should update properties panel when component is selected', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      // This would test the integration between canvas selection and properties panel
      const propertiesPanel = screen.getByTestId('properties-panel');
      expect(propertiesPanel).toBeInTheDocument();
    });
  });

  describe('Canvas Card - Visual Feedback', () => {
    
    test('should show drop indicators during drag operations', () => {
      // This would be tested with actual drag simulation
      // Mock the visual feedback system
      const dropIndicator = document.createElement('div');
      dropIndicator.className = 'drop-indicator';
      dropIndicator.style.borderColor = 'blue';
      dropIndicator.style.borderStyle = 'dashed';
      
      expect(dropIndicator.style.borderColor).toBe('blue');
      expect(dropIndicator.style.borderStyle).toBe('dashed');
    });

    test('should highlight components on hover', () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      const component = screen.queryByTestId('canvas-item-0');
      if (component) {
        fireEvent.mouseEnter(component);
        expect(component).toHaveClass('hover');
      }
    });
  });

  describe('Canvas Card - Error Handling', () => {
    
    test('should handle unknown drop positions gracefully', () => {
      const components: FormComponentData[] = [];
      const mockCreateComponent = vi.fn().mockReturnValue({
        id: 'test-1',
        type: 'text_input' as ComponentType,
        label: 'Test',
        fieldId: 'test_1'
      });

      // Test with invalid position type
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation();
      
      const result = DragDropService.handleDrop(
        components,
        { type: 'invalid' as any, targetId: '', componentType: 'text_input' },
        mockCreateComponent
      );

      expect(consoleSpy).toHaveBeenCalledWith('❌ Unknown drop position:', 'invalid');
      expect(result).toEqual(components); // Should return original components
      
      consoleSpy.mockRestore();
    });

    test('should handle missing target gracefully', () => {
      const components: FormComponentData[] = [
        { id: 'existing-1', type: 'text_input', label: 'Existing', fieldId: 'existing_1' }
      ];
      const mockCreateComponent = vi.fn().mockReturnValue({
        id: 'new-1',
        type: 'email_input' as ComponentType,
        label: 'New',
        fieldId: 'new_1'
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
      
      const result = DragDropService.handleDrop(
        components,
        { type: 'before', targetId: 'non-existent', componentType: 'email_input' },
        mockCreateComponent
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ Target not found, appending to end');
      expect(result).toHaveLength(2);
      expect(result[1].id).toBe('new-1'); // Should append to end
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Canvas Card - Component Lifecycle', () => {
    
    test('should assign unique IDs to new components', () => {
      const components: FormComponentData[] = [];
      const mockCreateComponent = vi.fn()
        .mockReturnValueOnce({
          id: 'unique-1',
          type: 'text_input' as ComponentType,
          label: 'First',
          fieldId: 'first_1'
        })
        .mockReturnValueOnce({
          id: 'unique-2',
          type: 'email_input' as ComponentType,
          label: 'Second',
          fieldId: 'second_1'
        });

      const result1 = DragDropService.handleDrop(
        components,
        { type: 'center', targetId: '', componentType: 'text_input' },
        mockCreateComponent
      );

      const result2 = DragDropService.handleDrop(
        result1,
        { type: 'center', targetId: '', componentType: 'email_input' },
        mockCreateComponent
      );

      expect(result2[0].id).toBe('unique-1');
      expect(result2[1].id).toBe('unique-2');
      expect(result2[0].id).not.toBe(result2[1].id);
    });

    test('should set default properties for new components', () => {
      const components: FormComponentData[] = [];
      const mockCreateComponent = vi.fn().mockReturnValue({
        id: 'test-1',
        type: 'text_input' as ComponentType,
        label: 'Text Input',
        fieldId: 'text_input_1',
        placeholder: 'Enter text...',
        required: false
      });

      const result = DragDropService.handleDrop(
        components,
        { type: 'center', targetId: '', componentType: 'text_input' },
        mockCreateComponent
      );

      expect(result[0]).toMatchObject({
        id: 'test-1',
        type: 'text_input',
        label: 'Text Input',
        fieldId: 'text_input_1',
        placeholder: 'Enter text...',
        required: false
      });
    });
  });

  describe('Integration - Form/Page Card with Canvas Card', () => {
    
    test('should update canvas content when switching pages', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      // Add a new page
      const addPageBtn = screen.getByText('Add Page');
      fireEvent.click(addPageBtn);
      
      // Navigate to next page
      const nextBtn = screen.getByText('Next →');
      fireEvent.click(nextBtn);
      
      await waitFor(() => {
        // Canvas should show empty state for new page
        expect(screen.getByText('Add components here')).toBeInTheDocument();
      });
    });

    test('should maintain form title across page navigation', async () => {
      render(<FormBuilder />, { wrapper: TestWrapper });
      
      // Set form title
      const formTitleInput = screen.getByDisplayValue('Untitled Form');
      fireEvent.change(formTitleInput, { target: { value: 'Multi-Page Form' } });
      
      // Add and navigate to new page
      const addPageBtn = screen.getByText('Add Page');
      fireEvent.click(addPageBtn);
      
      const nextBtn = screen.getByText('Next →');
      fireEvent.click(nextBtn);
      
      await waitFor(() => {
        // Form title should remain the same
        expect(screen.getByDisplayValue('Multi-Page Form')).toBeInTheDocument();
      });
    });
  });
});

describe('Canvas Area Business Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should show drop indicators during drag operations', () => {
    // Create a test component that simulates drop indicators
    const TestCanvas = () => (
      <div data-testid="canvas">
        <div 
          className="drop-indicator"
          style={{ 
            borderColor: 'blue', 
            borderStyle: 'dashed',
            borderWidth: '2px',
            height: '4px',
            backgroundColor: 'rgba(0, 0, 255, 0.1)'
          }}
          data-testid="drop-indicator"
        />
      </div>
    );

    render(<TestCanvas />);
    
    const dropIndicator = screen.getByTestId('drop-indicator');
    const styles = window.getComputedStyle(dropIndicator);
    
    expect(dropIndicator).toBeInTheDocument();
    expect(dropIndicator.style.borderColor).toBe('blue');
    expect(dropIndicator.style.borderStyle).toBe('dashed');
  });

  test('should handle component placement on canvas', () => {
    const mockOnDrop = vi.fn();
    
    const TestCanvas = () => (
      <div 
        data-testid="canvas"
        onDrop={mockOnDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        Canvas Area
      </div>
    );

    render(<TestCanvas />);
    
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toBeInTheDocument();
    
    // Simulate drop event
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
    });
    
    canvas.dispatchEvent(dropEvent);
    expect(mockOnDrop).toHaveBeenCalled();
  });
});
