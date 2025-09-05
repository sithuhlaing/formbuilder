import React from 'react';
import { render as rtlRender } from '@testing-library/react';

// Re-export everything
export * from '@testing-library/react';

// Simple wrapper for tests that don't need the full context
export function render(ui: React.ReactElement, options = {}) {
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
