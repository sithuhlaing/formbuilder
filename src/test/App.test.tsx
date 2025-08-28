
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

    // 2. Find and click the "Text Input" button in the sidebar to add it to the canvas
    const addComponentButton = screen.getByText('Text Input');
    await userEvent.click(addComponentButton);

    // 3. Verify the component was added to the canvas
    // We find it by its default label inside an element with the .form-component class
    const newComponentOnCanvas = await screen.findByText('Text Input', { selector: '.form-component *' });
    expect(newComponentOnCanvas).toBeInTheDocument();

    // 4. Select the new component to show its properties
    await userEvent.click(newComponentOnCanvas);

    // 5. Find the label input in the Properties panel and update it
    const labelInput = await screen.findByDisplayValue('Text Input');
    expect(labelInput).toBeInTheDocument();

    await userEvent.clear(labelInput);
    await userEvent.type(labelInput, 'Your Full Name');
    fireEvent.blur(labelInput); // Trigger update on blur

    // 6. Assert that the component's label on the canvas has been updated
    const updatedComponent = await screen.findByText('Your Full Name', { selector: '.form-component *' });
    expect(updatedComponent).toBeInTheDocument();

    // And verify the old label is gone from the canvas
    expect(screen.queryByText('Text Input', { selector: '.form-component *' })).toBeNull();
  });
});
