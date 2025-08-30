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

describe('Component Selection and Properties Panel', () => {
  beforeEach(() => {
    localStorage.clear();
    // Expose test helpers
    (window as any).getCanvasElements = () => 
      document.querySelectorAll('[data-testid^="canvas-item-"]');
  });

  describe('Component Selection', () => {
    it('should show no properties panel when no component is selected', () => {
      renderFormBuilder();
      
      const propertiesPanel = screen.queryByTestId('properties-panel');
      expect(propertiesPanel).not.toBeInTheDocument();
    });

    it('should select component when clicked on canvas', async () => {
      renderFormBuilder();
      
      // First add a component to the canvas
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
      
      // Click on the component to select it
      const canvasItems = (window as any).getCanvasElements();
      const firstComponent = canvasItems[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const propertiesPanel = screen.getByTestId('properties-panel');
        expect(propertiesPanel).toBeInTheDocument();
      });
    });

    it('should highlight selected component visually', async () => {
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        expect(firstComponent).toHaveClass(/selected|active/);
      });
    });

    it('should deselect component when clicking on empty canvas area', async () => {
      renderFormBuilder();
      
      // Add and select component first
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      // Verify component is selected
      await waitFor(() => {
        const propertiesPanel = screen.getByTestId('properties-panel');
        expect(propertiesPanel).toBeInTheDocument();
      });
      
      // Click on empty canvas area
      fireEvent.click(canvas);
      
      await waitFor(() => {
        const propertiesPanel = screen.queryByTestId('properties-panel');
        expect(propertiesPanel).not.toBeInTheDocument();
      });
    });
  });

  describe('Properties Panel Display', () => {
    it('should show correct component type in properties panel', async () => {
      renderFormBuilder();
      
      // Add text input component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const propertiesPanel = screen.getByTestId('properties-panel');
        expect(propertiesPanel).toBeInTheDocument();
        expect(screen.getByText('Component Properties')).toBeInTheDocument();
      });
    });

    it('should display basic properties for all components', async () => {
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        // Check for basic properties
        expect(screen.getByLabelText('Label')).toBeInTheDocument();
        expect(screen.getByLabelText('Required')).toBeInTheDocument();
      });
    });

    it('should show component-specific properties', async () => {
      renderFormBuilder();
      
      // Add text input and check for placeholder field
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        // Text input specific properties
        expect(screen.getByLabelText('Placeholder')).toBeInTheDocument();
      });
    });
  });

  describe('Property Editing', () => {
    it('should update component label when edited in properties panel', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const labelInput = screen.getByLabelText('Label');
        expect(labelInput).toBeInTheDocument();
      });
      
      // Edit the label
      const labelInput = screen.getByLabelText('Label');
      await user.clear(labelInput);
      await user.type(labelInput, 'Employee Name');
      
      // Verify the component label is updated
      await waitFor(() => {
        expect(labelInput).toHaveValue('Employee Name');
      });
    });

    it('should toggle required property', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const requiredCheckbox = screen.getByLabelText('Required');
        expect(requiredCheckbox).toBeInTheDocument();
      });
      
      // Toggle required checkbox
      const requiredCheckbox = screen.getByLabelText('Required') as HTMLInputElement;
      const initialState = requiredCheckbox.checked;
      
      await user.click(requiredCheckbox);
      
      await waitFor(() => {
        expect(requiredCheckbox.checked).toBe(!initialState);
      });
    });

    it('should update placeholder for text inputs', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      // Add text input
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const placeholderInput = screen.getByLabelText('Placeholder');
        expect(placeholderInput).toBeInTheDocument();
      });
      
      // Edit placeholder
      const placeholderInput = screen.getByLabelText('Placeholder');
      await user.clear(placeholderInput);
      await user.type(placeholderInput, 'Enter your full name');
      
      await waitFor(() => {
        expect(placeholderInput).toHaveValue('Enter your full name');
      });
    });

    it('should show validation options', async () => {
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const validationSelect = screen.getByLabelText('Validation Type');
        expect(validationSelect).toBeInTheDocument();
      });
    });
  });

  describe('Advanced Properties', () => {
    it('should show layout settings group', async () => {
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        expect(screen.getByText('Layout')).toBeInTheDocument();
        expect(screen.getByLabelText('Width')).toBeInTheDocument();
        expect(screen.getByLabelText('Alignment')).toBeInTheDocument();
      });
    });

    it('should show advanced settings group', async () => {
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        expect(screen.getByText('Advanced')).toBeInTheDocument();
        expect(screen.getByLabelText('Field ID')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Help Text')).toBeInTheDocument();
      });
    });

    it('should show readonly field ID', async () => {
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const fieldIdInput = screen.getByLabelText('Field ID');
        expect(fieldIdInput).toBeInTheDocument();
        expect(fieldIdInput).toHaveAttribute('readonly');
      });
    });
  });

  describe('Component-Specific Properties', () => {
    it('should show options for select components', async () => {
      renderFormBuilder();
      
      // Add select component
      const selectButton = screen.getByText('Select');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(selectButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        expect(screen.getByText('Options')).toBeInTheDocument();
      });
    });

    it('should show min/max values for number inputs', async () => {
      renderFormBuilder();
      
      // Add number input
      const numberInputButton = screen.getByText('Number Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(numberInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Minimum')).toBeInTheDocument();
        expect(screen.getByLabelText('Maximum')).toBeInTheDocument();
        expect(screen.getByLabelText('Step')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should update component in canvas when properties change', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const labelInput = screen.getByLabelText('Label');
        expect(labelInput).toBeInTheDocument();
      });
      
      // Change label
      const labelInput = screen.getByLabelText('Label');
      await user.clear(labelInput);
      await user.type(labelInput, 'Updated Label');
      
      // Verify canvas component reflects the change
      await waitFor(() => {
        const updatedComponent = (window as any).getCanvasElements()[0];
        expect(updatedComponent).toHaveTextContent('Updated Label');
      });
    });

    it('should persist property changes across selection changes', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      // Add two components
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBe(2);
      });
      
      // Select first component and change label
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const labelInput = screen.getByLabelText('Label');
        expect(labelInput).toBeInTheDocument();
      });
      
      const labelInput = screen.getByLabelText('Label');
      await user.clear(labelInput);
      await user.type(labelInput, 'First Component');
      
      // Select second component
      const secondComponent = (window as any).getCanvasElements()[1];
      fireEvent.click(secondComponent);
      
      // Select first component again
      fireEvent.click(firstComponent);
      
      // Verify the label persisted
      await waitFor(() => {
        const labelInput = screen.getByLabelText('Label');
        expect(labelInput).toHaveValue('First Component');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for properties panel', async () => {
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const propertiesPanel = screen.getByTestId('properties-panel');
        expect(propertiesPanel).toHaveAttribute('aria-label', 'Component properties editor');
      });
    });

    it('should support keyboard navigation in properties panel', async () => {
      const user = userEvent.setup();
      renderFormBuilder();
      
      // Add and select component
      const textInputButton = screen.getByText('Text Input');
      const canvas = screen.getByTestId('form-canvas');
      
      fireEvent.dragStart(textInputButton);
      fireEvent.drop(canvas);
      
      await waitFor(() => {
        const canvasItems = (window as any).getCanvasElements();
        expect(canvasItems.length).toBeGreaterThan(0);
      });
      
      const firstComponent = (window as any).getCanvasElements()[0];
      fireEvent.click(firstComponent);
      
      await waitFor(() => {
        const labelInput = screen.getByLabelText('Label');
        expect(labelInput).toBeInTheDocument();
      });
      
      // Tab through properties
      await user.tab();
      const labelInput = screen.getByLabelText('Label');
      expect(labelInput).toHaveFocus();
      
      await user.tab();
      const requiredCheckbox = screen.getByLabelText('Required');
      expect(requiredCheckbox).toHaveFocus();
    });
  });
});
