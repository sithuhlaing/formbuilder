import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import App from '../../../App';

// Mock the useFormBuilder hook
vi.mock('../../../features/form-builder/hooks/useFormBuilder', () => ({
  useFormBuilder: vi.fn(() => ({
    formState: {
      pages: [{
        id: 'page-1',
        title: 'Page 1',
        components: [],
        layout: {}
      }],
      currentPageId: 'page-1',
      templateName: 'Test Form'
    },
    currentComponents: [],
    selectedComponent: null,
    addComponent: vi.fn(),
    updateComponent: vi.fn(),
    deleteComponent: vi.fn(),
    selectComponent: vi.fn(),
    handleDrop: vi.fn(),
    updateProperty: vi.fn(),
    getCurrentPageIndex: vi.fn(() => 0),
    updateTemplateName: vi.fn(),
    onFormTitleChange: vi.fn(),
    addNewPage: vi.fn(),
    navigateToNextPage: vi.fn(),
    navigateToPreviousPage: vi.fn(),
    exportJSON: vi.fn(),
    clearAll: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false
  }))
}));

describe('🔬 Simple Component Addition Test', () => {
  it('should add a single component to canvas when clicked', async () => {
    // Render app and navigate to form builder
    render(
      <DndProvider backend={TestBackend}>
        <App />
      </DndProvider>
    );
    
    const createNewButton = screen.getByText('+ Create New Form');
    await userEvent.click(createNewButton);
    
    console.log('=== BEFORE ADDING COMPONENT ===');
    
    // Check initial canvas state
    const canvas = screen.getByTestId('canvas');
    const initialCount = canvas.querySelectorAll('[data-testid="canvas-item"]').length;
    console.log('Initial canvas elements:', initialCount);
    
    // Find and click "Text Input Field" component (matches ComponentEngine label)
    const textInputComponent = screen.getByText('Text Input Field');
    console.log('Found Text Input Field component:', textInputComponent.textContent);
    
    // Click to add
    await userEvent.click(textInputComponent);
    console.log('Clicked Text Input Field component');
    
    // Wait a moment for any async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('=== AFTER ADDING COMPONENT ===');
    
    // Check canvas state after adding  
    const finalCount = canvas.querySelectorAll('[data-testid^="canvas-item"]').length;
    console.log('Final canvas elements:', finalCount);
    
    // Print any components that were added
    const canvasItems = canvas.querySelectorAll('[data-testid^="canvas-item"]');
    console.log('Canvas items found:', canvasItems.length);
    canvasItems.forEach((item, i) => {
      const testId = item.getAttribute('data-testid');
      console.log(`Canvas item ${i}:`, testId, '|', item.textContent);
    });
    
    // Also check what exact data-testids exist
    const allTestIds = Array.from(canvas.querySelectorAll('*[data-testid]')).map(el => el.getAttribute('data-testid'));
    console.log('All data-testids in canvas:', allTestIds);
    
    expect(finalCount).toBe(1);
  });
});