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
    this.validateUIComponent(component, errors);
    
    return {
      isValid: errors.length === 0,
      valid: errors.length === 0,
      warnings: [],
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
        errors.push('At least one option is required');
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
  private static validateFileComponent(component: FormComponentData, _errors: string[]): void {
    if (component.type === 'file_upload') {
      // acceptedFileTypes validation could be added here
      // For now, we accept any value including '*'
      
      // Example validation that could be added:
      // if (component.acceptedFileTypes && component.acceptedFileTypes.length === 0) {
      //   errors.push('File upload must specify accepted file types');
      // }
    }
  }
  
  /**
   * Validates container components (layouts and cards)
   */
  private static validateContainerComponent(component: FormComponentData, errors: string[]): void {
    if (component.type === 'horizontal_layout' || component.type === 'vertical_layout' || component.type === 'card') {
      // Container components should have children array
      if ('children' in component) {
        if (!Array.isArray(component.children)) {
          errors.push('Container components must have a children array');
        }
      } else {
        errors.push('Container components must have a children property');
      }
    }
  }

  /**
   * Validates UI components (button, heading, section_divider)
   */
  private static validateUIComponent(component: FormComponentData, errors: string[]): void {
    // UI components are generally not required fields since they don't collect data
    if (component.type === 'button' || component.type === 'heading' || component.type === 'section_divider') {
      // These components should not be marked as required since they don't collect form data
      if (component.required) {
        errors.push('UI components (button, heading, section_divider) cannot be marked as required');
      }
    }
    
    // Button-specific validation
    if (component.type === 'button') {
      if (!component.defaultValue && !component.label) {
        errors.push('Button must have either a label or default value for display text');
      }
    }
    
    // Heading-specific validation
    if (component.type === 'heading') {
      if (!component.defaultValue && !component.label) {
        errors.push('Heading must have either a label or default value for display text');
      }
      
      // Validate heading level if specified in styling
      if (component.styling?.theme) {
        const validLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        if (!validLevels.includes(component.styling.theme)) {
          errors.push('Heading level must be one of: h1, h2, h3, h4, h5, h6');
        }
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
      valid: allValid,
      warnings: [],
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
      isValid: errors.length === 0,
      valid: errors.length === 0,
      warnings: [],
      errors,
      message: errors.join(', ')
    };
  }
}