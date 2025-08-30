/**
 * Form Page Card - Manages form title and page navigation
 * Part of the two-card middle panel structure
 */

import React from 'react';
import { FormWizardNavigation } from './FormWizardNavigation';
import type { FormPage } from '../../../types';

interface FormPageCardProps {
  formTitle: string;
  onFormTitleChange: (title: string) => void;
  currentPageIndex: number;
  totalPages: number;
  currentPageTitle: string;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onSubmit: () => void;
  onAddPage: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastPage: boolean;
  onUpdatePageTitle: (title: string) => void;
}

export const FormPageCard: React.FC<FormPageCardProps> = ({
  formTitle,
  onFormTitleChange,
  currentPageIndex,
  totalPages,
  currentPageTitle,
  onPreviousPage,
  onNextPage,
  onSubmit,
  onAddPage,
  canGoBack,
  canGoNext,
  isLastPage,
  onUpdatePageTitle,
}) => {
  return (
    <div className="form-page-card">
      {/* Form Title Section */}
      <div className="form-title-section">
        <label htmlFor="form-title-card" className="form-title-label">
          Form Title
        </label>
        <input
          id="form-title-card"
          type="text"
          value={formTitle}
          onChange={(e) => onFormTitleChange(e.target.value)}
          className="form-title-input"
          placeholder="Enter form title..."
          data-testid="form-title-input"
          aria-label="Form title"
          maxLength={100}
          onBlur={(e) => {
            const trimmed = e.target.value.trim();
            if (!trimmed) {
              onFormTitleChange('Untitled Form');
            } else {
              onFormTitleChange(trimmed);
            }
          }}
        />
      </div>

      {/* Page Management Section */}
      <div className="page-management-section">
        <FormWizardNavigation
          currentPageIndex={currentPageIndex}
          totalPages={totalPages}
          currentPageTitle={currentPageTitle}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          onSubmit={onSubmit}
          onAddPage={onAddPage}
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          isLastPage={isLastPage}
          onUpdatePageTitle={onUpdatePageTitle}
        />
      </div>
    </div>
  );
};
