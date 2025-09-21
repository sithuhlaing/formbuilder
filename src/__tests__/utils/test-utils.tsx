import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Re-export everything
export * from '@testing-library/react';

// Default render with DnD context for components that use react-dnd
export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(
    <DndProvider backend={HTML5Backend}>
      {ui}
    </DndProvider>,
    options
  );
}

// Render without DnD context for components that don't need it
export function renderSimple(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, options);
}

// Mock data
export const mockComponent = {
  id: 'test-id',
  type: 'text_input',
  label: 'Test Input',
  required: false,
  placeholder: 'Enter text here',
};

export const mockFormPage = {
  id: 'page-1',
  title: 'Test Page',
  components: [mockComponent],
};

// Test IDs
export const TEST_IDS = {
  CANVAS_CARD: 'canvas-card',
  FORM_PAGE_CARD: 'form-page-card',
  PREVIEW_FORM: 'preview-form',
  PREVIEW_MODAL: 'preview-modal',
  PROPERTIES_PANEL: 'properties-panel',
};
