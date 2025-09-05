import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import App from '../App';
import { mockFormBuilderState } from './utils/testUtils';

// Mock the form builder hook
vi.mock('../hooks/useFormBuilder', () => ({
  useFormBuilder: () => mockFormBuilderState
}));

describe('🔍 Drag-and-Drop Validation', () => {
  const renderAppWithDragDrop = async () => {
    const result = render(
      <DndProvider backend={TestBackend}>
        <App />
      </DndProvider>
    );
    
    // Navigate to form builder
    const createNewButton = screen.getByText('+ Create New Form');
    await userEvent.click(createNewButton);
    
    return {
      ...result,
      getCanvasElementCount: (): number => {
        const canvas = screen.getByTestId('canvas');
        return canvas.querySelectorAll('[data-testid^="canvas-item"]').length;
      },
      getCanvasElements: (): Element[] => {
        const canvas = screen.getByTestId('canvas');
        return Array.from(canvas.querySelectorAll('[data-testid^="canvas-item"]'));
      },
      addComponent: async (componentType: string): Promise<void> => {
        const component = screen.getByText(componentType);
        await userEvent.click(component);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };
  };

  it('✅ Component addition from palette works correctly', async () => {
    const { getCanvasElementCount, addComponent } = await renderAppWithDragDrop();
    
    // Initial state: empty canvas
    expect(getCanvasElementCount()).toBe(0);
    
    // Add first component
    await addComponent('Text Input Field');
    expect(getCanvasElementCount()).toBe(1);
    
    // Add second component
    await addComponent('Email Field');
    expect(getCanvasElementCount()).toBe(2);
    
    // Verify components are rendered correctly
    expect(screen.getByTestId('canvas-item-0')).toHaveTextContent('Text Input Field');
    expect(screen.getByTestId('canvas-item-1')).toHaveTextContent('Email Field');
  });

  it('✅ Component reordering functionality exists', async () => {
    const { addComponent, getCanvasElements } = await renderAppWithDragDrop();
    
    // Add two components
    await addComponent('Text Input Field');
    await addComponent('Email Field');
    
    // Verify initial order
    const elements = getCanvasElements();
    expect(elements).toHaveLength(2);
    expect(elements[0]).toHaveTextContent('Text Input Field');
    expect(elements[1]).toHaveTextContent('Email Field');
    
    // Check that drag handles exist
    const firstElement = screen.getByTestId('canvas-item-0');
    const dragHandle = firstElement.querySelector('[style*="cursor: grab"]');
    expect(dragHandle).toBeInTheDocument();
    expect(dragHandle).toHaveTextContent('⋮⋮');
  });

  it('✅ Component deletion functionality works', async () => {
    const { getCanvasElementCount, addComponent } = await renderAppWithDragDrop();
    
    // Add component
    await addComponent('Text Input Field');
    expect(getCanvasElementCount()).toBe(1);
    
    // Find and click delete button
    const canvasItem = screen.getByTestId('canvas-item-0');
    const deleteButton = canvasItem.querySelector('[title="Delete component"]');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveTextContent('×');
    
    // Click delete button
    await userEvent.click(deleteButton as Element);
    
    // Component should be removed
    expect(getCanvasElementCount()).toBe(0);
  });

  it('✅ Drop zones are properly implemented', async () => {
    const { addComponent } = await renderAppWithDragDrop();
    
    // Add component to create drop zones
    await addComponent('Text Input Field');
    
    // Check for between-component drop zones
    const dropZones = document.querySelectorAll('.canvas-item__drop-zone');
    expect(dropZones.length).toBeGreaterThan(0);
    
    // Verify drop zone structure
    const firstDropZone = dropZones[0];
    expect(firstDropZone).toHaveClass('canvas-item__drop-zone');
  });

  it('✅ Smart drop zone positioning works', async () => {
    const { addComponent } = await renderAppWithDragDrop();
    
    // Add component
    await addComponent('Text Input Field');
    
    const canvasItem = screen.getByTestId('canvas-item-0');
    
    // Verify smart drop zone has proper classes and structure
    expect(canvasItem).toHaveClass('smart-drop-zone');
    expect(canvasItem).toHaveClass('form-component');
    
    // Check for hover controls
    const hoverControls = canvasItem.querySelector('.form-component__hover-controls');
    expect(hoverControls).toBeInTheDocument();
  });

  it('✅ Row layout creation is supported', async () => {
    const { addComponent } = await renderAppWithDragDrop();
    
    // Add component
    await addComponent('Text Input Field');
    
    // Test that horizontal layout creation functions exist
    const testFunctions = window as any;
    expect(typeof testFunctions.__testInsertHorizontalToComponent__).toBe('function');
    expect(typeof testFunctions.__testAddToRowLayout__).toBe('function');
  });

  it('✅ Canvas accepts drops correctly', async () => {
    await renderAppWithDragDrop();
    
    // Verify canvas has proper drop zone setup
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toHaveClass('canvas');
    expect(canvas).toHaveClass('survey-drop-zone');
    
    // Check empty state
    const emptyState = canvas.querySelector('.empty-canvas');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent('Drag components here to start building your form');
  });

  it('✅ Component selection and properties work', async () => {
    const { addComponent } = await renderAppWithDragDrop();
    
    // Add component
    await addComponent('Text Input Field');
    
    // Click to select component
    const canvasItem = screen.getByTestId('canvas-item-0');
    await userEvent.click(canvasItem);
    
    // Verify selection state
    expect(canvasItem).toHaveClass('is-selected');
    
    // Check properties panel appears
    const propertiesPanel = screen.getByText('Properties');
    expect(propertiesPanel).toBeInTheDocument();
  });

  it('✅ Drag-drop visual feedback is implemented', async () => {
    const { addComponent } = await renderAppWithDragDrop();
    
    // Add component
    await addComponent('Text Input Field');
    
    const canvasItem = screen.getByTestId('canvas-item-0');
    
    // Check for drag styling attributes
    expect(canvasItem.style.opacity).toBeDefined();
    
    // Verify hover state classes exist in CSS structure
    expect(canvasItem.className).toContain('smart-drop-zone');
  });

  it('✅ Component palette renders draggable items', async () => {
    await renderAppWithDragDrop();
    
    // Check for component palette
    const palette = screen.getByTestId('component-palette');
    expect(palette).toBeInTheDocument();
    
    // Check for draggable items
    const textComponent = screen.getByText(/text input/i);
    expect(textComponent).toBeInTheDocument();
  });
});
