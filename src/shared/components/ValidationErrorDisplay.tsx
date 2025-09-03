/**
 * Validation Error Display Component
 * Shows validation errors for form fields and components
 */

import React from 'react';
import type { ValidationResult } from '../../core/ValidationEngine';

interface ValidationErrorDisplayProps {
  errors?: string[];
  warnings?: string[];
  className?: string;
  inline?: boolean;
}

interface FieldValidationProps {
  fieldId: string;
  validationResult?: ValidationResult;
  className?: string;
}

export const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({
  errors = [],
  warnings = [],
  className = '',
  inline = false
}) => {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  const baseClass = inline ? 'validation-inline' : 'validation-block';

  return (
    <div className={`validation-display ${baseClass} ${className}`}>
      {errors.length > 0 && (
        <div className="validation-errors">
          {errors.map((error, index) => (
            <div key={index} className="validation-error">
              <span className="validation-icon error-icon">⚠️</span>
              <span className="validation-message">{error}</span>
            </div>
          ))}
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className="validation-warnings">
          {warnings.map((warning, index) => (
            <div key={index} className="validation-warning">
              <span className="validation-icon warning-icon">⚠️</span>
              <span className="validation-message">{warning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const FieldValidationDisplay: React.FC<FieldValidationProps> = ({
  fieldId,
  validationResult,
  className = ''
}) => {
  if (!validationResult || validationResult.isValid) {
    return null;
  }

  return (
    <ValidationErrorDisplay
      errors={validationResult.errors}
      className={`field-validation ${className}`}
      inline={true}
    />
  );
};

// Form-level validation summary
interface FormValidationSummaryProps {
  validationResults: Record<string, ValidationResult>;
  onFieldFocus?: (fieldId: string) => void;
}

export const FormValidationSummary: React.FC<FormValidationSummaryProps> = ({
  validationResults,
  onFieldFocus
}) => {
  const invalidFields = Object.entries(validationResults).filter(
    ([_, result]) => !result.isValid
  );

  if (invalidFields.length === 0) {
    return null;
  }

  return (
    <div className="form-validation-summary">
      <div className="validation-summary-header">
        <span className="validation-icon error-icon">⚠️</span>
        <h4>Please fix the following errors:</h4>
      </div>
      
      <ul className="validation-summary-list">
        {invalidFields.map(([fieldId, result]) => (
          <li key={fieldId} className="validation-summary-item">
            <button
              type="button"
              className="validation-summary-link"
              onClick={() => onFieldFocus?.(fieldId)}
            >
              {result.errors?.[0] || 'Validation error'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
