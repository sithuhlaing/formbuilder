/**
 * PHASE 3: Validation System Implementation
 * Complete validation for layout operations
 */

import type { Component, ComponentType } from '../types/components';
import { LayoutEngine, DropPosition, type DragData, type ValidationResult, type ValidationError } from './layoutEngine';

// Validation rule types
export interface ValidationRule {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  validate: (context: ValidationContext) => boolean;
}

export interface ValidationContext {
  operation: 'create_row' | 'add_to_row' | 'move_component' | 'move_row' | 'delete_component';
  dragData?: DragData;
  targetComponent?: Component;
  sourceComponent?: Component;
  dropPosition?: DropPosition;
  parentComponents?: Component[];
  rowLayout?: Component;
}

export interface ComponentValidator {
  validateComponent: (component: Component) => ValidationResult;
  validateProperty: (component: Component, property: string, value: any) => ValidationResult;
}

export interface ValidationWarning {
  code: string;
  message: string;
  componentId?: string;
}

/**
 * Main Validation System Class
 */
export class ValidationSystem {
  
  private static rules: Map<string, ValidationRule[]> = new Map();
  
  /**
   * Initialize validation rules
   */
  static {
    this.initializeRules();
  }
  
  /**
   * Validate any layout operation
   */
  static validateOperation(context: ValidationContext): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // Get rules for this operation
    const operationRules = this.rules.get(context.operation) || [];
    
    // Run all rules
    for (const rule of operationRules) {
      if (!rule.validate(context)) {
        const validationError: ValidationError = {
          code: rule.code,
          message: rule.message,
          severity: rule.severity
        };
        
        if (rule.severity === 'error') {
          errors.push(validationError);
        } else {
          warnings.push({
            code: rule.code,
            message: rule.message,
            severity: 'warning' as const
          });
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate a single component
   */
  static validateComponent(component: Component): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // Basic component validation
    if (!component.id) {
      errors.push({
        code: 'COMPONENT_NO_ID',
        message: 'Component must have an ID.',
        severity: 'error'
      });
    }
    
    if (!component.type) {
      errors.push({
        code: 'COMPONENT_NO_TYPE',
        message: 'Component must have a type.',
        severity: 'error'
      });
    }
    
    if (!component.label) {
      errors.push({
        code: 'COMPONENT_NO_LABEL',
        message: 'Component must have a label.',
        severity: 'error'
      });
    }
    
    // Type-specific validation
    const typeValidation = this.validateComponentType(component);
    errors.push(...typeValidation.errors);
    warnings.push(...typeValidation.warnings);
    
    // Layout component validation
    if (component.type === 'horizontal_layout') {
      const layoutValidation = this.validateHorizontalLayout(component);
      errors.push(...layoutValidation.errors);
      warnings.push(...layoutValidation.warnings);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate component type
   */
  private static validateComponentType(component: Component): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    const validTypes: ComponentType[] = [
      'text_input', 'email_input', 'number_input', 'textarea',
      'select', 'radio_group', 'checkbox',
      'date_picker', 'file_upload',
      'horizontal_layout', 'vertical_layout',
      'button', 'heading', 'paragraph', 'divider', 'section_divider'
    ];
    
    if (!validTypes.includes(component.type)) {
      errors.push({
        code: 'INVALID_COMPONENT_TYPE',
        message: `Invalid component type: ${component.type}. Using text_input as fallback.`,
        severity: 'error'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate horizontal layout
   */
  private static validateHorizontalLayout(layout: Component): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    const children = layout.children || [];
    
    // Check minimum children
    if (children.length < 2) {
      warnings.push({
        code: 'ROW_MIN_CHILDREN',
        message: 'Horizontal layout should have at least 2 children.',
        severity: 'warning'
      });
    }
    
    // Check maximum children
    if (children.length > 4) {
      errors.push({
        code: 'ROW_MAX_CHILDREN',
        message: 'Horizontal layout cannot have more than 4 children.',
        severity: 'error'
      });
    }
    
    // Check for nested rows
    for (const child of children) {
      if (child.type === 'horizontal_layout') {
        errors.push({
          code: 'NESTED_HORIZONTAL_LAYOUT',
          message: 'Horizontal layouts cannot be nested inside other horizontal layouts.',
          severity: 'error'
        });
        break;
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Initialize all validation rules
   */
  private static initializeRules(): void {
    // Row creation rules
    this.rules.set('create_row', [
      {
        code: 'ROW_CREATION_INVALID_TARGET',
        message: 'Cannot create row with this target.',
        severity: 'error',
        validate: (context) => {
          return !!context.targetComponent && context.targetComponent.type !== 'horizontal_layout';
        }
      }
    ]);
    
    // Add to row rules
    this.rules.set('add_to_row', [
      {
        code: 'ROW_CAPACITY_EXCEEDED',
        message: 'This row already contains the maximum of 4 components.',
        severity: 'error',
        validate: (context) => {
          if (!context.rowLayout) return true;
          const currentChildren = context.rowLayout.children?.length || 0;
          return currentChildren < 4;
        }
      },
      {
        code: 'ROW_NESTING_NOT_ALLOWED',
        message: 'Cannot add horizontal layout to another horizontal layout.',
        severity: 'error',
        validate: (context) => {
          if (!context.dragData) return true;
          return context.dragData.componentType !== 'horizontal_layout';
        }
      }
    ]);
    
    // Component move rules
    this.rules.set('move_component', [
      {
        code: 'CIRCULAR_REFERENCE',
        message: 'Cannot drop component inside its own children.',
        severity: 'error',
        validate: (context) => {
          if (!context.sourceComponent || !context.targetComponent) return true;
          
          // Check if target is a child of source
          return !this.isChildOf(context.targetComponent, context.sourceComponent);
        }
      },
      {
        code: 'INVALID_DROP_POSITION',
        message: 'Invalid drop position for this component type.',
        severity: 'error',
        validate: (context) => {
          if (!context.sourceComponent || !context.dropPosition) return true;
          
          // Row layouts can only be positioned vertically
          if (context.sourceComponent.type === 'horizontal_layout') {
            return context.dropPosition === DropPosition.BEFORE || context.dropPosition === DropPosition.AFTER;
          }
          
          return true;
        }
      }
    ]);
    
    // Row move rules
    this.rules.set('move_row', [
      {
        code: 'ROW_HORIZONTAL_POSITIONING',
        message: 'Row layouts can only be repositioned vertically. Use top or bottom drop zones.',
        severity: 'error',
        validate: (context) => {
          if (!context.dropPosition) return true;
          return context.dropPosition !== DropPosition.LEFT && context.dropPosition !== DropPosition.RIGHT;
        }
      },
      {
        code: 'ROW_NESTING_PREVENTION',
        message: 'Cannot nest row layouts inside other rows.',
        severity: 'error',
        validate: (context) => {
          if (!context.targetComponent) return true;
          return context.targetComponent.type !== 'horizontal_layout';
        }
      }
    ]);
    
    // Component delete rules
    this.rules.set('delete_component', [
      {
        code: 'CANNOT_DELETE_REQUIRED',
        message: 'This component is required and cannot be deleted.',
        severity: 'error',
        validate: (context) => {
          if (!context.sourceComponent) return true;
          return !context.sourceComponent.required;
        }
      }
    ]);
  }
  
  /**
   * Check if component is a child of another component
   */
  private static isChildOf(child: Component, parent: Component): boolean {
    if (!parent.children) return false;
    
    for (const childComponent of parent.children) {
      if (childComponent.id === child.id) {
        return true;
      }
      
      if (childComponent.type === 'horizontal_layout' && this.isChildOf(child, childComponent)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Validate form field properties
   */
  static validateFormField(component: Component): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // Check field ID
    if (!component.fieldId) {
      warnings.push({
        code: 'NO_FIELD_ID',
        message: 'Form field should have a fieldId for data collection.',
        severity: 'warning'
      });
    }
    
    // Check validation rules
    if (component.validation) {
      const validation = component.validation;
      
      // Check pattern regex
      if (validation.pattern) {
        try {
          new RegExp(validation.pattern);
        } catch (e) {
          errors.push({
            code: 'INVALID_REGEX_PATTERN',
            message: 'Invalid regex pattern in validation.',
            severity: 'error'
          });
        }
      }
      
      // Check numeric constraints
      if (component.type === 'number_input') {
        if (validation.min !== undefined && validation.max !== undefined) {
          if (validation.min >= validation.max) {
            errors.push({
              code: 'INVALID_NUMERIC_RANGE',
              message: 'Minimum value must be less than maximum value.',
              severity: 'error'
            });
          }
        }
      }
      
      // Check string length constraints
      if (component.type === 'text_input' || component.type === 'textarea') {
        if (validation.minLength !== undefined && validation.maxLength !== undefined) {
          if (validation.minLength >= validation.maxLength) {
            errors.push({
              code: 'INVALID_LENGTH_RANGE',
              message: 'Minimum length must be less than maximum length.',
              severity: 'error'
            });
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate component options (for select, radio, checkbox)
   */
  static validateOptions(component: Component): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    if (!component.options) {
      if (component.type === 'select' || component.type === 'radio_group' || component.type === 'checkbox') {
        errors.push({
          code: 'NO_OPTIONS',
          message: `${component.type} requires options.`,
          severity: 'error'
        });
      }
      return { valid: errors.length === 0, errors, warnings };
    }
    
    if (!Array.isArray(component.options)) {
      errors.push({
        code: 'INVALID_OPTIONS_FORMAT',
        message: 'Options must be an array.',
        severity: 'error'
      });
      return { valid: errors.length === 0, errors, warnings };
    }
    
    // Check each option
    for (let i = 0; i < component.options.length; i++) {
      const option = component.options[i];
      
      if (!option.label) {
        errors.push({
          code: 'OPTION_NO_LABEL',
          message: `Option ${i + 1} must have a label.`,
          severity: 'error'
        });
      }
      
      if (!option.value) {
        errors.push({
          code: 'OPTION_NO_VALUE',
          message: `Option ${i + 1} must have a value.`,
          severity: 'error'
        });
      }
      
      // Check for duplicate values
      const duplicates = component.options.filter((opt, index) => 
        opt.value === option.value && index !== i
      );
      
      if (duplicates.length > 0) {
        errors.push({
          code: 'DUPLICATE_OPTION_VALUE',
          message: `Option value "${option.value}" is duplicated.`,
          severity: 'error'
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Get validation summary for debugging
   */
  static getValidationSummary(result: ValidationResult): string {
    if (result.valid) {
      return '✅ Validation passed';
    }
    
    const errorCount = result.errors.length;
    const warningCount = result.warnings.length;
    
    let summary = `❌ Validation failed: ${errorCount} error(s)`;
    
    if (warningCount > 0) {
      summary += `, ${warningCount} warning(s)`;
    }
    
    return summary;
  }
}

/**
 * Component validator factory
 */
export function createComponentValidator(): ComponentValidator {
  return {
    validateComponent: (component: Component) => {
      return ValidationSystem.validateComponent(component);
    },
    
    validateProperty: (component: Component, property: string, value: any) => {
      const errors: ValidationError[] = [];
      const warnings: ValidationError[] = [];
      
      // Property-specific validation
      switch (property) {
        case 'label':
          if (!value || value.trim() === '') {
            errors.push({
              code: 'EMPTY_LABEL',
              message: 'Label cannot be empty.',
              severity: 'error'
            });
          }
          break;
          
        case 'fieldId':
          if (!value || value.trim() === '') {
            warnings.push({
              code: 'EMPTY_FIELD_ID',
              message: 'Field ID is recommended for form submission.',
              severity: 'warning'
            });
          }
          break;
          
        case 'required':
          if (typeof value !== 'boolean') {
            errors.push({
              code: 'INVALID_REQUIRED_TYPE',
              message: 'Required property must be a boolean.',
              severity: 'error'
            });
          }
          break;
      }
      
      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    }
  };
}

export default ValidationSystem;
