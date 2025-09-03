/**
 * ALIGNED WITH DOCUMENTATION - Dependency Logic Engine
 * Handles conditional display rules and field dependencies
 */

import type { ConditionalRule } from '../types';

export class DependencyEngine {
  
  /**
   * Evaluate a single conditional rule against form data
   */
  static evaluateCondition(rule: ConditionalRule, formData: any): boolean {
    if (!rule || !rule.field || !formData) {
      return false;
    }
    
    const fieldValue = formData[rule.field];
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
        
      case 'not_equals':
        return fieldValue !== rule.value;
        
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(rule.value);
        }
        if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
          return fieldValue.includes(rule.value);
        }
        return false;
        
      case 'greater_than':
        if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
          return fieldValue > rule.value;
        }
        return false;
        
      case 'less_than':
        if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
          return fieldValue < rule.value;
        }
        return false;
        
      default:
        console.warn('Unknown conditional operator:', rule.operator);
        return false;
    }
  }
  
  /**
   * Evaluate multiple conditions with AND/OR logic
   */
  static evaluateConditions(
    conditions: ConditionalRule[], 
    operator: 'AND' | 'OR', 
    formData: any
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }
    
    if (operator === 'AND') {
      return conditions.every(condition => this.evaluateCondition(condition, formData));
    } else {
      return conditions.some(condition => this.evaluateCondition(condition, formData));
    }
  }
  
  /**
   * Check if a component should be visible based on its conditional display rules
   */
  static shouldShowComponent(
    conditionalDisplay: { showWhen?: ConditionalRule; hideWhen?: ConditionalRule } | undefined,
    formData: any
  ): boolean {
    if (!conditionalDisplay) {
      return true; // Show by default if no conditional rules
    }
    
    // Check hideWhen rule first
    if (conditionalDisplay.hideWhen) {
      const shouldHide = this.evaluateCondition(conditionalDisplay.hideWhen, formData);
      if (shouldHide) {
        return false;
      }
    }
    
    // Check showWhen rule
    if (conditionalDisplay.showWhen) {
      return this.evaluateCondition(conditionalDisplay.showWhen, formData);
    }
    
    // If no showWhen rule and hideWhen didn't trigger, show the component
    return true;
  }
  
  /**
   * Get all field dependencies for a given component
   * Returns list of field IDs that this component depends on
   */
  static getFieldDependencies(
    conditionalDisplay: { showWhen?: ConditionalRule; hideWhen?: ConditionalRule } | undefined
  ): string[] {
    const dependencies: string[] = [];
    
    if (conditionalDisplay?.showWhen?.field) {
      dependencies.push(conditionalDisplay.showWhen.field);
    }
    
    if (conditionalDisplay?.hideWhen?.field) {
      dependencies.push(conditionalDisplay.hideWhen.field);
    }
    
    return [...new Set(dependencies)]; // Remove duplicates
  }
  
  /**
   * Create dependency rules for common scenarios
   */
  static createShowWhenRule(field: string, operator: ConditionalRule['operator'], value: any): ConditionalRule {
    return {
      field,
      operator,
      value
    };
  }
  
  static createHideWhenRule(field: string, operator: ConditionalRule['operator'], value: any): ConditionalRule {
    return {
      field,
      operator,
      value
    };
  }
  
  /**
   * Batch evaluate all conditional logic for a form
   * Returns visibility state for all components
   */
  static evaluateFormConditionalLogic(
    components: Array<{ id: string; conditionalDisplay?: { showWhen?: ConditionalRule; hideWhen?: ConditionalRule } }>,
    formData: any
  ): Record<string, boolean> {
    const visibilityMap: Record<string, boolean> = {};
    
    components.forEach(component => {
      visibilityMap[component.id] = this.shouldShowComponent(component.conditionalDisplay, formData);
    });
    
    return visibilityMap;
  }
}