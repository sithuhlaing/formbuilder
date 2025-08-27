import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import App from '../App';

describe('🔍 Debug Component Palette', () => {
  it('should inspect component palette structure', async () => {
    render(
      <DndProvider backend={TestBackend}>
        <App />
      </DndProvider>
    );
    
    // Navigate to form builder
    const createNewButton = screen.getByText('+ Create New Form');
    await userEvent.click(createNewButton);
    
    // Debug: Print all text content to see what's available
    console.log('=== COMPONENT PALETTE DEBUG ===');
    
    // Look for elements with draggable-component-item class
    const draggableItems = document.querySelectorAll('.draggable-component-item');
    console.log('Draggable component items found:', draggableItems.length);
    draggableItems.forEach((item, i) => {
      console.log(`Component ${i}:`, item.textContent);
    });
    
    // Try to find elements by specific component names
    try {
      const textInput = screen.getByText('Text Input');
      console.log('Found Text Input element:', textInput.tagName, textInput.textContent);
    } catch (e) {
      console.log('Text Input not found directly');
    }
    
    // Look for all divs containing component-like text
    const allDivs = document.querySelectorAll('div');
    const componentDivs = Array.from(allDivs).filter(div => 
      div.textContent && div.textContent.includes('Input')
    );
    console.log('Divs containing "Input":', componentDivs.length);
    componentDivs.forEach((div, i) => {
      console.log(`Input div ${i}:`, div.textContent?.trim());
    });
    
    // Check for any elements with "Text" in them
    try {
      const textElements = screen.getAllByText(/text/i);
      console.log('Elements containing "text":', textElements.length);
      textElements.forEach((el, i) => {
        console.log(`Text element ${i}:`, el.textContent, 'TagName:', el.tagName);
      });
    } catch (e) {
      console.log('No elements with "text" found');
    }
  });
});