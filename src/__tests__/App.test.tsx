
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from '../App';

describe('App Integration Test', () => {
  it('should add a component by clicking, and then update its properties', async () => {
    // 1. Render the App. We use HTML5Backend since we are not simulating DND events.
    render(
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    );

    // 2. Navigate from template list to form builder
    const createNewFormButton = screen.getByText('+ Create New Form');
    await userEvent.click(createNewFormButton);

    // 3. Find and click the "Text Input" button in the sidebar to add it to the canvas
    const addComponentButton = await screen.findByText('Text Input');
    await userEvent.click(addComponentButton);

    // 4. Verify the component was added to the canvas
    // We find it by its default label "Text Input Field" in a canvas item
    const canvasItem = await screen.findByTestId('canvas-item-0');
    expect(canvasItem).toHaveTextContent('Text Input Field');

    // 5. Select the new component by clicking on it to show its properties
    await userEvent.click(canvasItem);

    // 6. Find the label input in the Properties panel and update it
    const labelInput = await screen.findByDisplayValue('Text Input Field');
    expect(labelInput).toBeInTheDocument();

    // Simply use fireEvent.change which is more reliable for testing controlled inputs
    // This approach directly sets the value and triggers the change event
    fireEvent.change(labelInput, { target: { value: 'Name' } });
    
    // Wait for any async updates to complete (shorter wait since throttle is reduced in tests)
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Re-query the canvas item to get the updated version
    const updatedCanvasItem = await screen.findByTestId('canvas-item-0');
    expect(updatedCanvasItem).toHaveTextContent('Name');

    // And verify the old label is gone from the canvas
    expect(updatedCanvasItem).not.toHaveTextContent('Text Input Field');
  });
});
