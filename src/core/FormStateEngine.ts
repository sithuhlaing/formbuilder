/**
 * FormStateEngine - Form Validation and State Management
 * Handles form-level validation and state operations
 */

import type { FormPage } from '../hooks/useSimpleFormBuilder';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class FormStateEngine {
  /**
   * Validates the entire form state
   */
  static validateFormState(pages: FormPage[]): ValidationResult {
    const errors: string[] = [];

    // Must have at least one page
    if (!pages || pages.length === 0) {
      errors.push('Form must have at least one page');
      return { valid: false, errors };
    }

    // Validate each page
    pages.forEach((page, index) => {
      if (!page.title || page.title.trim() === '') {
        errors.push(`Page ${index + 1} must have a title`);
      }

      if (!page.id) {
        errors.push(`Page ${index + 1} must have an ID`);
      }

      if (!Array.isArray(page.components)) {
        errors.push(`Page ${index + 1} must have a components array`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a single page
   */
  static validatePage(page: FormPage): ValidationResult {
    const errors: string[] = [];

    if (!page.title || page.title.trim() === '') {
      errors.push('Page title is required');
    }

    if (!page.id) {
      errors.push('Page ID is required');
    }

    if (!Array.isArray(page.components)) {
      errors.push('Page must have a components array');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}