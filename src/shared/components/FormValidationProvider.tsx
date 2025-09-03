/**
 * Form Validation Provider
 * Manages validation state for entire forms
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ValidationResult } from '../../types';

interface ValidationState {
  fieldValidations: Record<string, ValidationResult>;
  formIsValid: boolean;
  hasErrors: boolean;
}

interface FormValidationContextType {
  validationState: ValidationState;
  updateFieldValidation: (fieldId: string, result: ValidationResult) => void;
  clearValidation: () => void;
  validateForm: () => boolean;
  getFieldValidation: (fieldId: string) => ValidationResult | undefined;
}

const FormValidationContext = createContext<FormValidationContextType | null>(null);

export const useFormValidation = () => {
  const context = useContext(FormValidationContext);
  if (!context) {
    throw new Error('useFormValidation must be used within FormValidationProvider');
  }
  return context;
};

interface FormValidationProviderProps {
  children: React.ReactNode;
  onValidationChange?: (isValid: boolean, validations: Record<string, ValidationResult>) => void;
}

export const FormValidationProvider: React.FC<FormValidationProviderProps> = ({
  children,
  onValidationChange
}) => {
  const [validationState, setValidationState] = useState<ValidationState>({
    fieldValidations: {},
    formIsValid: true,
    hasErrors: false
  });

  const updateFieldValidation = useCallback((fieldId: string, result: ValidationResult) => {
    setValidationState(prev => {
      const newFieldValidations = {
        ...prev.fieldValidations,
        [fieldId]: result
      };

      const hasErrors = Object.values(newFieldValidations).some(r => !r.isValid);
      const formIsValid = !hasErrors;

      const newState = {
        fieldValidations: newFieldValidations,
        formIsValid,
        hasErrors
      };

      // Notify parent of validation changes
      onValidationChange?.(formIsValid, newFieldValidations);

      return newState;
    });
  }, [onValidationChange]);

  const clearValidation = useCallback(() => {
    setValidationState({
      fieldValidations: {},
      formIsValid: true,
      hasErrors: false
    });
    onValidationChange?.(true, {});
  }, [onValidationChange]);

  const validateForm = useCallback(() => {
    const hasErrors = Object.values(validationState.fieldValidations).some(r => !r.isValid);
    return !hasErrors;
  }, [validationState.fieldValidations]);

  const getFieldValidation = useCallback((fieldId: string) => {
    return validationState.fieldValidations[fieldId];
  }, [validationState.fieldValidations]);

  const contextValue: FormValidationContextType = {
    validationState,
    updateFieldValidation,
    clearValidation,
    validateForm,
    getFieldValidation
  };

  return (
    <FormValidationContext.Provider value={contextValue}>
      {children}
    </FormValidationContext.Provider>
  );
};
