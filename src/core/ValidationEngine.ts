/**
 * ALIGNED WITH DOCUMENTATION - Form Validation Engine
 * Multi-Level Validation: Field, Page, Form, and Schema levels
 */

import type { 
  FormComponentData, 
  FormPage, 
  FormSchema, 
  ValidationResult, 
  ValidationRule,
  ConditionalRule 
} from '../types';

export class ValidationEngine {
  
  /**
   * Field-Level Validation
   * Validates individual component against its validation rules
   */
  static validateComponent(component: FormComponentData, value?: any): ValidationResult {
    const errors: string[] = [];
    
    // Check required validation
    if (component.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(`${component.label} is required`);
    }
    
    // Apply validation rules
    component.validationRules?.forEach(rule => {
      const ruleResult = this.validateRule(rule, value, component);
      if (!ruleResult.isValid) {
        errors.push(ruleResult.message || `Validation failed for ${component.label}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      valid: errors.length === 0,
      warnings: errors.length === 0 ? undefined : errors,
      errors,
      message: errors.join(', ')
    };
  }
  
  /**
   * Page-Level Validation
   * Cross-field validation within pages
   */
  static validatePage(page: FormPage, pageData: any): ValidationResult {
    const errors: string[] = [];
    
    // Validate each component on the page
    page.components.forEach(component => {
      const fieldValue = pageData[component.fieldId];
      const componentResult = this.validateComponent(component, fieldValue);
      
      if (!componentResult.isValid) {
        errors.push(...(componentResult.errors || []));
      }
    });
    
    // Apply page-level validation rules
    page.validationRules?.forEach(rule => {
      if (rule.validator) {
        const ruleResult = rule.validator(pageData);
        if (!ruleResult.isValid) {
          errors.push(rule.message || ruleResult.message || 'Page validation failed');
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      valid: errors.length === 0,
      warnings: errors.length === 0 ? undefined : errors,
      errors,
      message: errors.join('; ')
    };
  }
  
  /**
   * Form-Level Validation
   * Global validation across all pages
   */
  static validateForm(formSchema: FormSchema, formData: any): ValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string[]> = {};
    
    // Validate each page
    formSchema.pages.forEach((page, pageIndex) => {
      const pageData = this.extractPageData(page, formData);
      const pageResult = this.validatePage(page, pageData);
      
      if (!pageResult.isValid) {
        pageResult.errors?.forEach(error => {
          errors.push(`Page ${pageIndex + 1}: ${error}`);
        });
      }
    });
    
    // Apply global validation rules
    formSchema.globalValidationRules?.forEach(rule => {
      const ruleResult = this.validateRule(rule, formData, null);
      if (!ruleResult.isValid) {
        errors.push(ruleResult.message || 'Global validation failed');
      }
    });
    
    return {
      isValid: errors.length === 0,
      valid: errors.length === 0,
      warnings: errors.length === 0 ? undefined : errors,
      errors,
      message: errors.join('; ')
    };
  }
  
  /**
   * Schema-Level Validation
   * Data structure validation
   */
  static validateDataStructure(data: any, expectedStructure: any): ValidationResult {
    try {
      // Basic data structure validation
      const errors: string[] = [];
      
      // Check if data exists
      if (data === null || data === undefined) {
        errors.push('Data is null or undefined');
      }
      
      // Check expected structure if provided
      if (expectedStructure && typeof expectedStructure === 'object') {
        for (const key of Object.keys(expectedStructure)) {
          if (!(key in data)) {
            errors.push(`Missing required field: ${key}`);
          }
        }
      }
      
      // Basic type validation for common structures
      if (data && typeof data === 'object') {
        // Check for common form data structure
        if ('pages' in data && !Array.isArray(data.pages)) {
          errors.push('Pages must be an array');
        }
        
        if ('templateName' in data && typeof data.templateName !== 'string') {
          errors.push('Template name must be a string');
        }
      }
      
      return {
        isValid: errors.length === 0,
        valid: errors.length === 0,
        warnings: errors.length === 0 ? undefined : errors,
        message: errors.length > 0 ? errors.join(', ') : 'Data structure is valid'
      };
    } catch (error) {
      return {
        isValid: false,
        valid: false,
        warnings: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Private helper methods
   */
  private static validateRule(rule: ValidationRule, value: any, component: FormComponentData | null): ValidationResult {
    switch (rule.type) {
      case 'required':
        const isValid = value !== null && value !== undefined && value !== '';
        return {
          isValid,
          valid: isValid,
          warnings: isValid ? undefined : [rule.message || 'This field is required'],
          message: rule.message || 'This field is required'
        };
        
      case 'minLength':
        if (typeof value === 'string') {
          const isValid = value.length >= (rule.value || 0);
          return {
            isValid,
            valid: isValid,
            warnings: isValid ? undefined : [rule.message || `Minimum length is ${rule.value}`],
            message: isValid ? undefined : rule.message || `Minimum length is ${rule.value}`
          };
        }
        return { isValid: true, valid: true, warnings: undefined };
        
      case 'maxLength':
        if (typeof value === 'string') {
          const isValid = value.length <= (rule.value || Infinity);
          return {
            isValid,
            valid: isValid,
            warnings: isValid ? undefined : [rule.message || `Maximum length is ${rule.value}`],
            message: isValid ? undefined : rule.message || `Maximum length is ${rule.value}`
          };
        }
        return { isValid: true, valid: true, warnings: undefined };
        
      case 'pattern':
        if (typeof value === 'string' && rule.value) {
          const regex = new RegExp(rule.value);
          const isValid = regex.test(value);
          return {
            isValid,
            valid: isValid,
            warnings: isValid ? undefined : [rule.message || 'Invalid format'],
            message: isValid ? undefined : rule.message || 'Invalid format'
          };
        }
        return { isValid: true, valid: true, warnings: undefined };
        
      case 'email':
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const isValid = emailRegex.test(value);
          return {
            isValid,
            valid: isValid,
            warnings: isValid ? undefined : [rule.message || 'Invalid email address'],
            message: isValid ? undefined : rule.message || 'Invalid email address'
          };
        }
        return { isValid: true, valid: true, warnings: undefined };
        
      case 'custom':
        if (rule.validator) {
          return rule.validator(value);
        }
        return { isValid: true, valid: true, warnings: undefined };
        
      default:
        console.warn('Unknown validation rule type:', rule.type);
        return { isValid: true, valid: true, warnings: undefined };
    }
  }
  
  private static extractPageData(page: FormPage, formData: any): any {
    const pageData: any = {};
    
    page.components.forEach(component => {
      if (component.fieldId && formData.hasOwnProperty(component.fieldId)) {
        pageData[component.fieldId] = formData[component.fieldId];
      }
    });
    
    return pageData;
  }
  
  /**
   * Validation rule builders for common cases
   */
  static createRequiredRule(message?: string): ValidationRule {
    return {
      type: 'required',
      message: message || 'This field is required'
    };
  }
  
  static createMinLengthRule(minLength: number, message?: string): ValidationRule {
    return {
      type: 'minLength',
      value: minLength,
      message: message || `Minimum length is ${minLength} characters`
    };
  }
  
  static createMaxLengthRule(maxLength: number, message?: string): ValidationRule {
    return {
      type: 'maxLength',
      value: maxLength,
      message: message || `Maximum length is ${maxLength} characters`
    };
  }
  
  static createEmailRule(message?: string): ValidationRule {
    return {
      type: 'email',
      message: message || 'Please enter a valid email address'
    };
  }
  
  static createPatternRule(pattern: string, message?: string): ValidationRule {
    return {
      type: 'pattern',
      value: pattern,
      message: message || 'Invalid format'
    };
  }
}