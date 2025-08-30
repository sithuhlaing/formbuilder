
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { vi } from 'vitest';

// Mock form builder hook
export const mockFormBuilderState = {
  currentForm: {
    id: 'test-form',
    title: 'Test Form',
    pages: [{
      id: 'page-1',
      title: 'Page 1',
      components: []
    }]
  },
  currentPageIndex: 0,
  isPreviewMode: false,
  addComponent: vi.fn(),
  updateComponent: vi.fn(),
  deleteComponent: vi.fn(),
  moveComponent: vi.fn(),
  setPreviewMode: vi.fn(),
  addPage: vi.fn(),
  deletePage: vi.fn(),
  setCurrentPage: vi.fn()
};

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
};

// Custom render function
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

// Specific render for drag-drop tests
export const renderAppWithDragDrop = async () => {
  const App = (await import('../../App')).default;
  return renderWithProviders(<App />);
};

// Mock component data
export const mockComponents = {
  textInput: {
    id: 'text-1',
    type: 'text',
    label: 'Text Input',
    required: false,
    placeholder: 'Enter text'
  },
  select: {
    id: 'select-1',
    type: 'select',
    label: 'Select Option',
    required: false,
    options: ['Option 1', 'Option 2']
  }
};
