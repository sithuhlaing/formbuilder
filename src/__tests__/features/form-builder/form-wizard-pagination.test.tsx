/**
 * Form Wizard Pagination Test Case
 * Tests multi-page form creation, navigation, and submission workflow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormBuilder } from '../../../features/form-builder/components/FormBuilder';
import { createMockFormBuilderState, mockUseFormBuilder } from '../../mocks/useFormBuilderMock';

describe('Form Wizard Pagination', () => {
  const mockFormBuilderReturn = {
    ...createMockFormBuilderState(),
    templateName: 'Multi-Page Form',
    pages: [
      { id: 'page1', title: 'Personal Information', components: [], layout: {}, order: 0 },
      { id: 'page2', title: 'Contact Details', components: [], layout: {}, order: 1 },
      { id: 'page3', title: 'Preferences', components: [], layout: {}, order: 2 }
    ],
    currentPageId: 'page1',
    handleFormSubmit: vi.fn(() => true),
    updatePageTitle: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFormBuilder.mockReturnValue(mockFormBuilderReturn);
  });

  const renderFormBuilder = () => {
    return render(
      <DndProvider backend={HTML5Backend}>
        <FormBuilder />
      </DndProvider>
    );
  };

  describe('Multi-Page Form Creation and Navigation', () => {
    it('should display page title and navigation controls', () => {
      renderFormBuilder();

      // Check page title is displayed
      expect(screen.getByTestId('page-title')).toHaveTextContent('Personal Information');
      
      // Check page indicator shows correct page number
      expect(screen.getByTestId('page-indicator')).toHaveTextContent('Page 1 of 3');
      
      // Check navigation buttons are present
      expect(screen.getByTestId('previous-page-btn')).toBeInTheDocument();
      expect(screen.getByTestId('next-page-btn')).toBeInTheDocument();
      expect(screen.getByTestId('add-page-btn')).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      renderFormBuilder();

      const previousBtn = screen.getByTestId('previous-page-btn');
      expect(previousBtn).toBeDisabled();
    });

    it('should enable next button when not on last page', () => {
      renderFormBuilder();

      const nextBtn = screen.getByTestId('next-page-btn');
      expect(nextBtn).not.toBeDisabled();
    });

    it('should navigate to next page when next button is clicked', () => {
      renderFormBuilder();

      const nextBtn = screen.getByTestId('next-page-btn');
      fireEvent.click(nextBtn);

      expect(mockFormBuilderReturn.navigateToNextPage).toHaveBeenCalledTimes(1);
    });

    it('should navigate to previous page when previous button is clicked', () => {
      // Mock being on page 2
      const mockStatePage2 = {
        ...mockFormBuilderReturn,
        pages: mockFormBuilderReturn.pages,
        currentPageId: 'page2',
        getCurrentPageIndex: vi.fn(() => 1)
      };
      mockUseFormBuilder.mockReturnValue(mockStatePage2);

      renderFormBuilder();

      const previousBtn = screen.getByTestId('previous-page-btn');
      fireEvent.click(previousBtn);

      expect(mockFormBuilderReturn.navigateToPreviousPage).toHaveBeenCalledTimes(1);
    });

    it('should add new page when add page button is clicked', () => {
      renderFormBuilder();

      const addPageBtn = screen.getByTestId('add-page-btn');
      fireEvent.click(addPageBtn);

      expect(mockFormBuilderReturn.addNewPage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Last Page Submission Workflow', () => {
    beforeEach(() => {
      // Mock being on the last page
      const mockStateLastPage = {
        ...mockFormBuilderReturn,
        pages: mockFormBuilderReturn.pages,
        currentPageId: 'page3',
        getCurrentPageIndex: vi.fn(() => 2)
      };
      mockUseFormBuilder.mockReturnValue(mockStateLastPage);
    });

    it('should show submit button on last page instead of next button', () => {
      renderFormBuilder();

      // Submit button should be present
      expect(screen.getByTestId('submit-form-btn')).toBeInTheDocument();
      
      // Next button should not be present
      expect(screen.queryByTestId('next-page-btn')).not.toBeInTheDocument();
    });

    it('should call handleFormSubmit when submit button is clicked', () => {
      renderFormBuilder();

      const submitBtn = screen.getByTestId('submit-form-btn');
      fireEvent.click(submitBtn);

      expect(mockFormBuilderReturn.handleFormSubmit).toHaveBeenCalledTimes(1);
    });

    it('should display page indicator correctly on last page', () => {
      renderFormBuilder();

      expect(screen.getByTestId('page-indicator')).toHaveTextContent('Page 3 of 3');
    });
  });

  describe('Page Title Editing', () => {
    it('should allow editing page title', () => {
      renderFormBuilder();

      const titleInput = screen.getByTestId('page-title-input');
      expect(titleInput).toHaveValue('Personal Information');

      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      expect(mockFormBuilderReturn.updatePageTitle).toHaveBeenCalledWith('page1', 'Updated Title');
    });

    it('should show placeholder when page title is empty', () => {
      const mockStateEmptyTitle = {
        ...mockFormBuilderReturn,
        pages: [
          { id: 'page1', title: '', components: [], layout: {}, order: 0 }
        ]
      };
      mockUseFormBuilder.mockReturnValue(mockStateEmptyTitle);

      renderFormBuilder();

      const titleInput = screen.getByTestId('page-title-input');
      expect(titleInput).toHaveAttribute('placeholder', 'Enter page title...');
    });
  });

  describe('Form Wizard Integration with Drag and Drop', () => {
    it('should create multi-page form with drag and drop components', async () => {
      // Mock form state with components on different pages
      const mockStateWithComponents = {
        ...mockFormBuilderReturn,
        pages: [
          {
            id: 'page1',
            title: 'Personal Information',
            components: [
              { id: 'comp1', type: 'text_input', label: 'First Name', required: true, fieldId: 'first_name' },
              { id: 'comp2', type: 'text_input', label: 'Last Name', required: true, fieldId: 'last_name' }
            ],
            layout: {}
          },
          {
            id: 'page2',
            title: 'Contact Details',
            components: [
              { id: 'comp3', type: 'email_input', label: 'Email Address', required: true, fieldId: 'email' },
              { id: 'comp4', type: 'text_input', label: 'Phone Number', required: false, fieldId: 'phone' }
            ],
            layout: {}
          }
        ]
      };

      mockUseFormBuilder.mockReturnValue(mockStateWithComponents);

      renderFormBuilder();

      // Verify page 1 shows correct title and components
      expect(screen.getByTestId('page-title')).toHaveTextContent('Personal Information');
      expect(screen.getByTestId('canvas')).toBeInTheDocument();

      // Navigate to page 2
      const nextBtn = screen.getByTestId('next-page-btn');
      fireEvent.click(nextBtn);

      // Mock navigation to page 2
      const mockStatePage2 = {
        ...mockStateWithComponents,
        currentPageId: 'page2',
        getCurrentPageIndex: vi.fn(() => 1)
      };
      mockUseFormBuilder.mockReturnValue(mockStatePage2);

      // Re-render to simulate state change
      renderFormBuilder();

      expect(screen.getByTestId('page-title')).toHaveTextContent('Contact Details');
    });

    it('should handle form submission with validation', () => {
      // Mock form with empty pages (should fail validation)
      const mockStateFailValidation = {
        ...mockFormBuilderReturn,
        handleFormSubmit: vi.fn(() => false),
        currentPageId: 'page3',
        getCurrentPageIndex: vi.fn(() => 2)
      };
      mockUseFormBuilder.mockReturnValue(mockStateFailValidation);

      renderFormBuilder();

      const submitBtn = screen.getByTestId('submit-form-btn');
      fireEvent.click(submitBtn);

      expect(mockFormBuilderReturn.handleFormSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Progress Indicator', () => {
    it('should show correct progress percentage', () => {
      renderFormBuilder();

      const progressBar = screen.getByTestId('page-indicator').querySelector('.progress-fill');
      expect(progressBar).toHaveStyle({ width: '33.333333333333336%' }); // Page 1 of 3
    });

    it('should update progress when navigating pages', () => {
      // Mock being on page 2
      const mockStatePage2 = {
        ...mockFormBuilderReturn,
        currentPageId: 'page2',
        getCurrentPageIndex: vi.fn(() => 1)
      };
      mockUseFormBuilder.mockReturnValue(mockStatePage2);

      renderFormBuilder();

      const progressBar = screen.getByTestId('page-indicator').querySelector('.progress-fill');
      expect(progressBar).toHaveStyle({ width: '66.66666666666667%' }); // Page 2 of 3
    });
  });
});
