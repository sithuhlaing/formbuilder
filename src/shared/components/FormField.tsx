/**
 * Reusable FormField Component
 * Provides consistent structure for all form fields
 */

import React from 'react';
import { classNames } from '../utils';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  helpText?: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  className,
  children,
  helpText,
  error
}) => {
  const requiredMark = required ? ' *' : '';

  return (
    <div className={classNames('form-field', className, error && 'form-field--error')}>
      {label && (
        <label className="form-field__label">
          {label}{requiredMark}
        </label>
      )}
      
      <div className="form-field__input-container">
        {children}
      </div>
      
      {helpText && (
        <div className="form-field__help-text">
          {helpText}
        </div>
      )}
      
      {error && (
        <div className="form-field__error-message">
          {error}
        </div>
      )}
    </div>
  );
};