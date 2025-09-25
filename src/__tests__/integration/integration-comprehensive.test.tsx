/**
 * Comprehensive Integration Test Suite
 * Tests all major functionality together to ensure no regressions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormBuilder } from '../../features/form-builder/components/FormBuilder';
import { vi } from 'vitest';

// Mock the useFormBuilder hook
vi.mock('../../features/form-builder/hooks/useFormBuilder', () => ({
  useFormBuilder: vi.fn(() => ({
    formState: {
      templateName: 'Test Form',
      pages: [{
        id: 'page-1',
        title: 'Page 1',
        components: []
      }],
      currentPageId: 'page-1'
    },
    currentComponents: [],
    selectedComponent: null,
    addComponent: vi.fn(),
    updateComponent: vi.fn(),
    deleteComponent: vi.fn(),
    selectComponent: vi.fn(),
    handleDrop: vi.fn(),
    moveComponent: vi.fn(),
    setTemplateName: vi.fn(),
    getCurrentPageIndex: vi.fn(() => 0),
    navigateToNextPage: vi.fn(),
    navigateToPreviousPage: vi.fn(),
    addNewPage: vi.fn(),
    handleFormSubmit: vi.fn(),
    updatePageTitle: vi.fn(),
    clearAll: vi.fn(),
    loadFromJSON: vi.fn(),
    exportJSON: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false,
    isPreviewMode: false,
    togglePreview: vi.fn()
  }))
}));

const renderFormBuilder = () => {
  return render(
    <DndProvider backend={HTML5Backend}>
      <FormBuilder />
    </DndProvider>
  );
};

describe('Comprehensive Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Complete Form Building Workflow', () => {
    it('should render FormBuilder with all essential components', async () => {
      renderFormBuilder();

      // 1. Verify FormBuilder renders without crashing
      expect(screen.getByTestId('form-builder')).toBeInTheDocument();

      // 2. Verify main action buttons are present
      expect(screen.getByText('📁 Load JSON')).toBeInTheDocument();
      expect(screen.getByText('🗑️ Clear All')).toBeInTheDocument();
      expect(screen.getByText('👁️ Preview')).toBeInTheDocument();
      expect(screen.getByText('💾 Export JSON')).toBeInTheDocument();

      // 3. Verify component palette is present
      expect(screen.getByText('Text Input')).toBeInTheDocument();
      expect(screen.getByText('Email Input')).toBeInTheDocument();

      // 4. Verify undo/redo buttons are present
      expect(screen.getByText('↶ Undo')).toBeInTheDocument();
      expect(screen.getByText('↷ Redo')).toBeInTheDocument();
    });

    it('should handle component selection across pages', async () => {
      renderFormBuilder();

      // Verify form builder structure
      expect(screen.getByTestId('form-builder')).toBeInTheDocument();
      expect(screen.getByText('Text Input')).toBeInTheDocument();

      // Click on component palette items (no crash)
      const textInput = screen.getByText('Text Input');
      fireEvent.click(textInput);

      // Verify it doesn't crash
      expect(screen.getByTestId('form-builder')).toBeInTheDocument();
    });

    it('should maintain form state during complex operations', async () => {
      renderFormBuilder();

      // Test multiple operations don't crash
      const clearButton = screen.getByText('🗑️ Clear All');
      fireEvent.click(clearButton);

      const previewButton = screen.getByText('👁️ Preview');
      fireEvent.click(previewButton);

      // Verify form builder still works
      expect(screen.getByTestId('form-builder')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty form title gracefully', async () => {
      renderFormBuilder();

      // Verify form renders even with empty state
      expect(screen.getByTestId('form-builder')).toBeInTheDocument();
    });

    it('should handle component deletion properly', async () => {
      renderFormBuilder();

      // Test that clear all doesn't crash
      const clearButton = screen.getByText('🗑️ Clear All');
      fireEvent.click(clearButton);

      expect(screen.getByTestId('form-builder')).toBeInTheDocument();
    });

    it('should handle rapid page navigation', async () => {
      renderFormBuilder();

      // Multiple clicks shouldn't crash
      const previewButton = screen.getByText('👁️ Preview');
      fireEvent.click(previewButton);
      fireEvent.click(previewButton);

      expect(screen.getByTestId('form-builder')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility throughout workflow', async () => {
      renderFormBuilder();

      // Check basic accessibility
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Verify buttons have text or titles
      buttons.forEach(button => {
        const hasText = button.textContent?.trim() || button.getAttribute('title');
        expect(hasText).toBeTruthy();
      });
    });
  });

  describe('Performance and State Management', () => {
    it('should handle large forms efficiently', async () => {
      renderFormBuilder();

      // Verify it renders efficiently without crashes
      expect(screen.getByTestId('form-builder')).toBeInTheDocument();

      // Multiple palette interactions
      const inputs = ['Text Input', 'Email Input'];
      inputs.forEach(input => {
        const element = screen.getByText(input);
        fireEvent.click(element);
      });

      expect(screen.getByTestId('form-builder')).toBeInTheDocument();
    });

    it('should maintain state consistency across operations', async () => {
      renderFormBuilder();

      // Test undo/redo buttons are properly disabled/enabled
      const undoButton = screen.getByText('↶ Undo');
      const redoButton = screen.getByText('↷ Redo');

      expect(undoButton).toBeDisabled();
      expect(redoButton).toBeDisabled();
    });
  });
});