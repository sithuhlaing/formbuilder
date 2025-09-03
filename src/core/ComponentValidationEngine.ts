/**
 * SOLID PRINCIPLE REFACTORING - Single Responsibility Principle
 * ValidationEngine focuses ONLY on component validation logic
 * Separated from ComponentEngine for better maintainability
 */

import type { ValidationResult } from '../types';
import type { FormComponentData, OptionsComponent, NumericComponent } from './interfaces/ComponentInterfaces';

export class ComponentValidationEngine {
  
  /**
   * Validates a single component according to its type and properties
   */
  static validateComponent(component: FormComponentData): ValidationResult {
    const errors: string[] = [];
    
    // Base validation - all components need these
    if (!component.label?.trim()) {
      errors.push('Label is required');
    }
    
    if (!component.id?.trim()) {
      errors.push('Component ID is required');
    }
    
    if (!component.fieldId?.trim()) {
      errors.push('Field ID is required');
    }
    
    // Type-specific validation using interface segregation
    this.validateOptionsComponent(component, errors);
    this.validateNumericComponent(component, errors);
    this.validateFileComponent(component, errors);
    this.validateContainerComponent(component, errors);
    
    return {
      valid: errors.length === 0,
      errors,
      message: errors.join(', ')
    };
  }
  
  /**
   * Validates components that have options (select, multi_select, radio_group)
   */
  private static validateOptionsComponent(component: FormComponentData, errors: string[]): void {
    // Check if component has options property
    if ('options' in component && component.options !== undefined) {
      const optionsComponent = component as FormComponentData & OptionsComponent;
      
      if (!optionsComponent.options || optionsComponent.options.length === 0) {
        errors.push('At least one option is required for choice-based components');
      }
      
      // Validate option structure
      optionsComponent.options?.forEach((option, index) => {
        if (!option.label?.trim()) {
          errors.push(`Option ${index + 1} must have a label`);
        }
        if (option.value === undefined || option.value === null) {
          errors.push(`Option ${index + 1} must have a value`);
        }
      });
      
      // Check for duplicate values
      const values = optionsComponent.options?.map(opt => opt.value) || [];
      const uniqueValues = new Set(values);
      if (values.length !== uniqueValues.size) {
        errors.push('Option values must be unique');
      }
    }
  }
  
  /**
   * Validates numeric components (number_input)
   */
  private static validateNumericComponent(component: FormComponentData, errors: string[]): void {
    if (component.type === 'number_input') {
      const numericComponent = component as FormComponentData & NumericComponent;
      
      if (numericComponent.min !== undefined && numericComponent.max !== undefined) {
        if (numericComponent.min >= numericComponent.max) {
          errors.push('Minimum value must be less than maximum value');
        }
      }
      
      if (numericComponent.step !== undefined && numericComponent.step <= 0) {
        errors.push('Step value must be greater than 0');
      }
    }
  }
  
  /**
   * Validates file upload components
   */
  private static validateFileComponent(component: FormComponentData, errors: string[]): void {
    if (component.type === 'file_upload') {
      // acceptedFileTypes validation could be added here
      // For now, we accept any value including '*'
    }
  }
  
  /**
   * Validates container components (layouts)
   */
  private static validateContainerComponent(component: FormComponentData, errors: string[]): void {
    if (component.type === 'horizontal_layout' || component.type === 'vertical_layout') {
      // Container components should have children array
      if ('children' in component) {
        if (!Array.isArray(component.children)) {
          errors.push('Layout components must have a children array');
        }
      } else {
        errors.push('Layout components must have a children property');
      }
    }
  }
  
  /**
   * Validates an array of components recursively
   */
  static validateComponents(components: FormComponentData[]): ValidationResult {
    const allErrors: string[] = [];
    let allValid = true;
    
    components.forEach((component, index) => {
      const result = this.validateComponent(component);
      if (!result.isValid) {
        allValid = false;
        allErrors.push(`Component ${index + 1} (${component.label}): ${result.message}`);
      }
      
      // Validate nested children recursively
      if ('children' in component && Array.isArray(component.children)) {
        const childrenResult = this.validateComponents(component.children);
        if (!childrenResult.isValid) {
          allValid = false;
          allErrors.push(`Component ${index + 1} children: ${childrenResult.message}`);
        }
      }
    });
    
    return {
      isValid: allValid,
      errors: allErrors,
      message: allErrors.join('; ')
    };
  }
  
  /**
   * Validates required field values during form submission
   */
  static validateRequiredFields(
    components: FormComponentData[], 
    formData: Record<string, unknown>
  ): ValidationResult {
    const errors: string[] = [];
    
    const validateRequired = (comps: FormComponentData[]) => {
      comps.forEach(component => {
        if (component.required) {
          const value = formData[component.fieldId];
          
          if (value === undefined || value === null || value === '') {
            errors.push(`${component.label} is required`);
          }
          
          // Special handling for arrays (multi_select, checkboxes)
          if (Array.isArray(value) && value.length === 0) {
            errors.push(`${component.label} is required`);
          }
        }
        
        // Validate nested components
        if ('children' in component && Array.isArray(component.children)) {
          validateRequired(component.children);
        }
      });
    };
    
    validateRequired(components);
    
    return {
      valid: errors.length === 0,
      errors,
      message: errors.join(', ')
    };
  }
}