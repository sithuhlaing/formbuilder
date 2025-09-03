/**
 * Validated Form Field Component
 * Wraps form fields with real-time validation and error display
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ValidationEngine } from '../../core/ValidationEngine';
import { FieldValidationDisplay } from './ValidationErrorDisplay';
import type { FormComponentData } from '../../types/component';
import type { ValidationResult } from '../../types';

interface ValidatedFormFieldProps {
  component: FormComponentData;
  value?: any;
  onChange?: (value: any) => void;
  onValidation?: (fieldId: string, result: ValidationResult) => void;
  className?: string;
  children: React.ReactNode;
}

export const ValidatedFormField: React.FC<ValidatedFormFieldProps> = ({
  component,
  value,
  onChange,
  onValidation,
  className = '',
  children
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const [isDirty, setIsDirty] = useState(false);

  // Validate field value
  const validateField = useCallback((fieldValue: any) => {
    const result = ValidationEngine.validateComponent(component, fieldValue);
    setValidationResult(result);
    onValidation?.(component.fieldId, result);
    return result;
  }, [component, onValidation]);

  // Handle value changes
  const handleChange = useCallback((newValue: any) => {
    setIsDirty(true);
    onChange?.(newValue);
    
    // Real-time validation for dirty fields
    if (isDirty) {
      validateField(newValue);
    }
  }, [onChange, validateField, isDirty]);

  // Handle blur events for validation
  const handleBlur = useCallback(() => {
    if (isDirty) {
      validateField(value);
    }
  }, [validateField, value, isDirty]);

  // Validate on mount if field has a value
  useEffect(() => {
    if (value !== undefined && value !== '') {
      validateField(value);
    }
  }, [validateField, value]);

  // Determine field state classes
  const getFieldStateClass = () => {
    if (!isDirty || validationResult.isValid) return '';
    return 'has-error';
  };

  return (
    <div className={`validated-form-field ${getFieldStateClass()} ${className}`}>
      {/* Clone children and add validation props */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onChange: handleChange,
            onBlur: handleBlur,
            'aria-invalid': !validationResult.isValid,
            'aria-describedby': !validationResult.isValid ? `${component.fieldId}-error` : undefined
          });
        }
        return child;
      })}
      
      {/* Validation error display */}
      {isDirty && (
        <FieldValidationDisplay
          fieldId={component.fieldId}
          validationResult={validationResult}
        />
      )}
    </div>
  );
};
