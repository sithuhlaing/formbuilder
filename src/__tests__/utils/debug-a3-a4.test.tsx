import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import App from '../App';

describe('🔍 Debug A3 and A4 Issues', () => {
  it('should debug element sizing and text content', async () => {
    render(
      <DndProvider backend={TestBackend}>
        <App />
      </DndProvider>
    );
    
    // Navigate to form builder
    const createNewButton = screen.getByText('+ Create New Form');
    await userEvent.click(createNewButton);
    
    // Add first element
    console.log('=== ADDING TEXT INPUT ===');
    const textInput = screen.getByText('Text Input');
    await userEvent.click(textInput);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Debug element properties
    const element = screen.getByTestId('canvas-item-0');
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    
    console.log('Element rect:', {
      height: rect.height,
      width: rect.width,
      top: rect.top,
      left: rect.left
    });
    
    console.log('Element styles:', {
      height: styles.height,
      width: styles.width,
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity
    });
    
    console.log('Element content:', element.textContent);
    console.log('Element innerHTML:', element.innerHTML);
    
    // Add second element
    console.log('=== ADDING EMAIL INPUT ===');
    const emailInput = screen.getByText('Email Input');
    await userEvent.click(emailInput);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Debug canvas state
    const canvas = screen.getByTestId('canvas');
    const allItems = canvas.querySelectorAll('[data-testid^="canvas-item"]');
    console.log('Canvas items count:', allItems.length);
    
    allItems.forEach((item, i) => {
      console.log(`Item ${i}:`, {
        testId: item.getAttribute('data-testid'),
        textContent: item.textContent,
        rect: item.getBoundingClientRect()
      });
    });
    
    // Look for text patterns
    try {
      const textField = screen.getByText('Text Input Field');
      console.log('Found "Text Input Field":', textField.textContent);
    } catch {
      console.log('Could not find "Text Input Field"');
    }
    
    try {
      const emailField = screen.getByText('Email Field');
      console.log('Found "Email Field":', emailField.textContent);
    } catch {
      console.log('Could not find "Email Field"');
    }
    
    // Try partial matches
    const allElements = screen.getAllByText(/field/i);
    console.log('Elements containing "field":', allElements.length);
    allElements.forEach((el, i) => {
      console.log(`Field element ${i}:`, el.textContent);
    });
  });
});