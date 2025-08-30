/**
 * Form Wizard Navigation Component
 * Handles multi-page form navigation with next/previous/submit buttons and page reordering
 */

import React from 'react';

interface FormWizardNavigationProps {
  currentPageIndex: number;
  totalPages: number;
  currentPageTitle: string;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onSubmit: () => void;
  onAddPage: () => void;
  onUpdatePageTitle?: (title: string) => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastPage: boolean;
}

export const FormWizardNavigation: React.FC<FormWizardNavigationProps> = ({
  currentPageIndex,
  totalPages,
  currentPageTitle,
  onPreviousPage,
  onNextPage,
  onSubmit,
  onAddPage,
  onUpdatePageTitle,
  canGoBack,
  canGoNext,
  isLastPage,
}) => {
  return (
    <div className="form-wizard-navigation" data-testid="form-wizard-navigation">
      {/* Page Title and Indicator */}
      <div className="wizard-header">
        {onUpdatePageTitle ? (
          <input
            type="text"
            value={currentPageTitle}
            onChange={(e) => onUpdatePageTitle(e.target.value)}
            onBlur={(e) => {
              const trimmed = e.target.value.trim();
              if (!trimmed) {
                onUpdatePageTitle('Untitled Page');
              } else {
                onUpdatePageTitle(trimmed);
              }
            }}
            className="wizard-title-input"
            data-testid="page-title-input"
            aria-label="Page title"
            maxLength={50}
          />
        ) : (
          <h2 className="wizard-title" data-testid="page-title">
            {currentPageTitle}
          </h2>
        )}
        <div className="wizard-progress" data-testid="page-indicator">
          <span className="page-counter">
            Page {currentPageIndex + 1} of {totalPages}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="wizard-controls">
        <div className="wizard-buttons">
          {/* Previous Button */}
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={!canGoBack}
            className="wizard-btn wizard-btn--secondary"
            data-testid="previous-page-btn"
          >
            ← Previous
          </button>

          {/* Next Button (only show if not last page) */}
          {!isLastPage && (
            <button
              type="button"
              onClick={onNextPage}
              disabled={!canGoNext}
              className="wizard-btn wizard-btn--primary"
              data-testid="next-page-btn"
            >
              Next →
            </button>
          )}

          {/* Submit Button (only show on last page) */}
          {isLastPage && (
            <button
              type="button"
              onClick={onSubmit}
              className="wizard-btn wizard-btn--success"
              data-testid="submit-form-btn"
            >
              Submit Form
            </button>
          )}

          {/* Add Page Button */}
          <button
            type="button"
            onClick={onAddPage}
            className="wizard-btn wizard-btn--outline"
            data-testid="add-page-btn"
          >
            + Add Page
          </button>
        </div>
      </div>
    </div>
  );
};
