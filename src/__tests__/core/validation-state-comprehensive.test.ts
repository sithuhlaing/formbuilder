/**
 * Comprehensive Validation and State Management Test Suite
 * Covers all validation rules, state transitions, and edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentEngine } from '../core/ComponentEngine';
import { FormStateEngine } from '../core/FormStateEngine';
import { ComponentValidationEngine } from '../core/ComponentValidationEngine';
import type { FormComponentData, FormPage } from '../types/component';

describe('🔍 Validation & State Management - Complete Coverage', () => {

  describe('Component Validation - All Scenarios', () => {

    describe('Required Field Validation', () => {
      it('should validate required text inputs', () => {
        const component = ComponentEngine.createComponent('text_input');
        component.required = true;
        component.label = 'Required Field';

        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);

        // Test with empty label
        const invalidComponent = { ...component, label: '' };
        const invalidValidation = ComponentValidationEngine.validateComponent(invalidComponent);
        expect(invalidValidation.valid).toBe(false);
        expect(invalidValidation.errors).toContain('Label is required');
      });

      it('should validate required email inputs', () => {
        const component = ComponentEngine.createComponent('email_input');
        component.required = true;

        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);
      });

      it('should validate required number inputs', () => {
        const component = ComponentEngine.createComponent('number_input');
        component.required = true;
        component.min = 0;
        component.max = 100;

        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);

        // Test invalid range
        component.min = 100;
        component.max = 0;
        const invalidValidation = ComponentValidationEngine.validateComponent(component);
        expect(invalidValidation.valid).toBe(false);
        expect(invalidValidation.errors).toContain('Minimum value must be less than maximum value');
      });
    });

    describe('Selection Component Validation', () => {
      it('should validate select components', () => {
        const component = ComponentEngine.createComponent('select');
        
        // Valid select with default options
        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);

        // Invalid select with empty options
        component.options = [];
        const invalidValidation = ComponentValidationEngine.validateComponent(component);
        expect(invalidValidation.valid).toBe(false);
        expect(invalidValidation.errors).toContain('At least one option is required');
      });

      it('should validate multi-select components', () => {
        const component = ComponentEngine.createComponent('multi_select');
        
        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);

        // Test with duplicate values
        component.options = [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt1' } // Duplicate value
        ];
        const duplicateValidation = ComponentValidationEngine.validateComponent(component);
        expect(duplicateValidation.valid).toBe(false);
        expect(duplicateValidation.errors).toContain('Option values must be unique');
      });

      it('should validate radio group components', () => {
        const component = ComponentEngine.createComponent('radio_group');
        
        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);

        // Test with invalid options
        component.options = [
          { label: '', value: 'empty' }, // Empty label
          { label: 'Valid', value: '' }   // Empty value
        ];
        const invalidValidation = ComponentValidationEngine.validateComponent(component);
        expect(invalidValidation.valid).toBe(false);
      });

      it('should validate checkbox components', () => {
        const component = ComponentEngine.createComponent('checkbox');
        
        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);
      });
    });

    describe('Layout Component Validation', () => {
      it('should validate horizontal layout components', () => {
        const component = ComponentEngine.createComponent('horizontal_layout');
        
        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);

        // Test with too many children
        component.children = [
          ComponentEngine.createComponent('text_input'),
          ComponentEngine.createComponent('text_input'),
          ComponentEngine.createComponent('text_input'),
          ComponentEngine.createComponent('text_input'),
          ComponentEngine.createComponent('text_input') // 5th child - too many
        ];
        const overCapacityValidation = ComponentValidationEngine.validateComponent(component);
        expect(overCapacityValidation.valid).toBe(false);
        expect(overCapacityValidation.errors).toContain('Horizontal layout can contain maximum 4 components');
      });

      it('should validate vertical layout components', () => {
        const component = ComponentEngine.createComponent('vertical_layout');
        
        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);
      });
    });

    describe('Special Component Validation', () => {
      it('should validate file upload components', () => {
        const component = ComponentEngine.createComponent('file_upload');
        component.acceptedFileTypes = ['.pdf', '.doc', '.docx'];
        component.maxFileSize = 10; // 10MB

        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);

        // Test with invalid file size
        component.maxFileSize = -1;
        const invalidValidation = ComponentValidationEngine.validateComponent(component);
        expect(invalidValidation.valid).toBe(false);
        expect(invalidValidation.errors).toContain('Maximum file size must be positive');
      });

      it('should validate signature components', () => {
        const component = ComponentEngine.createComponent('signature');
        
        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);
      });

      it('should validate date picker components', () => {
        const component = ComponentEngine.createComponent('date_picker');
        component.minDate = '2024-01-01';
        component.maxDate = '2024-12-31';

        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);

        // Test with invalid date range
        component.minDate = '2024-12-31';
        component.maxDate = '2024-01-01';
        const invalidValidation = ComponentValidationEngine.validateComponent(component);
        expect(invalidValidation.valid).toBe(false);
        expect(invalidValidation.errors).toContain('Minimum date must be before maximum date');
      });

      it('should validate rich text components', () => {
        const component = ComponentEngine.createComponent('rich_text');
        component.height = 200;
        component.maxLength = 1000;

        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);

        // Test with invalid dimensions
        component.height = -100;
        const invalidValidation = ComponentValidationEngine.validateComponent(component);
        expect(invalidValidation.valid).toBe(false);
        expect(invalidValidation.errors).toContain('Height must be positive');
      });

      it('should validate textarea components', () => {
        const component = ComponentEngine.createComponent('textarea');
        component.rows = 5;
        component.minLength = 10;
        component.maxLength = 500;

        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(true);

        // Test with invalid length constraints
        component.minLength = 500;
        component.maxLength = 10;
        const invalidValidation = ComponentValidationEngine.validateComponent(component);
        expect(invalidValidation.valid).toBe(false);
        expect(invalidValidation.errors).toContain('Minimum length must be less than maximum length');
      });
    });

    describe('Field ID Validation', () => {
      it('should validate unique field IDs', () => {
        const component1 = ComponentEngine.createComponent('text_input');
        const component2 = ComponentEngine.createComponent('email_input');
        component2.fieldId = component1.fieldId; // Duplicate field ID

        const components = [component1, component2];
        const validation = ComponentValidationEngine.validateComponentCollection(components);
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain(`Duplicate field ID: ${component1.fieldId}`);
      });

      it('should validate field ID format', () => {
        const component = ComponentEngine.createComponent('text_input');
        component.fieldId = '123 invalid field id!'; // Invalid characters

        const validation = ComponentValidationEngine.validateComponent(component);
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Field ID must contain only letters, numbers, and underscores');
      });
    });

    describe('Cross-Component Validation', () => {
      it('should validate conditional logic references', () => {
        const triggerComponent = ComponentEngine.createComponent('checkbox');
        const targetComponent = ComponentEngine.createComponent('text_input');
        
        // Set up conditional display
        targetComponent.conditionalDisplay = {
          showWhen: {
            field: triggerComponent.fieldId,
            operator: 'equals',
            value: true
          }
        };

        const components = [triggerComponent, targetComponent];
        const validation = ComponentValidationEngine.validateComponentCollection(components);
        expect(validation.valid).toBe(true);

        // Test with invalid reference
        targetComponent.conditionalDisplay.showWhen.field = 'nonexistent_field';
        const invalidValidation = ComponentValidationEngine.validateComponentCollection(components);
        expect(invalidValidation.valid).toBe(false);
        expect(invalidValidation.errors).toContain('Conditional logic references nonexistent field: nonexistent_field');
      });
    });
  });

  describe('Form State Validation - Complete Coverage', () => {

    describe('Page Validation', () => {
      it('should validate form with valid pages', () => {
        const validPages: FormPage[] = [{
          id: 'page1',
          title: 'Valid Page',
          components: [ComponentEngine.createComponent('text_input')],
          layout: {}
        }];

        const validation = FormStateEngine.validateFormState(validPages);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });

      it('should reject forms without pages', () => {
        const validation = FormStateEngine.validateFormState([]);
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Form must have at least one page');
      });

      it('should validate page titles', () => {
        const invalidPages: FormPage[] = [{
          id: 'page1',
          title: '',
          components: [],
          layout: {}
        }];

        const validation = FormStateEngine.validateFormState(invalidPages);
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Page 1 must have a title');
      });

      it('should validate page IDs are unique', () => {
        const invalidPages: FormPage[] = [
          {
            id: 'page1',
            title: 'Page 1',
            components: [],
            layout: {}
          },
          {
            id: 'page1', // Duplicate ID
            title: 'Page 2',
            components: [],
            layout: {}
          }
        ];

        const validation = FormStateEngine.validateFormState(invalidPages);
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Duplicate page ID: page1');
      });
    });

    describe('Component Cross-Validation', () => {
      it('should validate components within pages', () => {
        const invalidComponent = ComponentEngine.createComponent('select');
        invalidComponent.options = []; // Invalid - no options

        const pages: FormPage[] = [{
          id: 'page1',
          title: 'Page 1',
          components: [invalidComponent],
          layout: {}
        }];

        const validation = FormStateEngine.validateFormState(pages);
        expect(validation.valid).toBe(false);
        expect(validation.errors.some(error => error.includes('At least one option is required'))).toBe(true);
      });

      it('should validate component field ID uniqueness across pages', () => {
        const component1 = ComponentEngine.createComponent('text_input');
        const component2 = ComponentEngine.createComponent('email_input');
        component2.fieldId = component1.fieldId; // Duplicate field ID

        const pages: FormPage[] = [
          {
            id: 'page1',
            title: 'Page 1',
            components: [component1],
            layout: {}
          },
          {
            id: 'page2',
            title: 'Page 2',
            components: [component2],
            layout: {}
          }
        ];

        const validation = FormStateEngine.validateFormState(pages);
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain(`Duplicate field ID across pages: ${component1.fieldId}`);
      });
    });
  });

  describe('State Transitions - Complete Coverage', () => {

    describe('Component State Mutations', () => {
      let initialState: any;

      beforeEach(() => {
        initialState = {
          pages: [{
            id: 'page1',
            title: 'Page 1',
            components: [],
            layout: {}
          }],
          currentPageId: 'page1',
          selectedComponentId: null,
          templateName: 'Test Form',
          templateId: null
        };
      });

      it('should handle sequential component additions', () => {
        let currentState = initialState;

        // Add multiple components
        const componentTypes = ['text_input', 'email_input', 'select', 'textarea'];
        
        componentTypes.forEach(type => {
          currentState = FormStateEngine.executeAction(currentState, {
            type: 'ADD_COMPONENT',
            payload: { componentType: type, pageId: 'page1' }
          });
        });

        expect(currentState.pages[0].components).toHaveLength(4);
        componentTypes.forEach((type, index) => {
          expect(currentState.pages[0].components[index].type).toBe(type);
        });
      });

      it('should handle component updates with validation', () => {
        // Add a component first
        let currentState = FormStateEngine.executeAction(initialState, {
          type: 'ADD_COMPONENT',
          payload: { componentType: 'select', pageId: 'page1' }
        });

        const componentId = currentState.pages[0].components[0].id;

        // Valid update
        currentState = FormStateEngine.executeAction(currentState, {
          type: 'UPDATE_COMPONENT',
          payload: {
            componentId,
            updates: {
              label: 'Updated Select',
              options: [{ label: 'Option 1', value: 'opt1' }]
            }
          }
        });

        const updatedComponent = currentState.pages[0].components[0];
        expect(updatedComponent.label).toBe('Updated Select');
        expect(updatedComponent.options).toHaveLength(1);
      });

      it('should handle component deletion and selection cleanup', () => {
        // Add components
        let currentState = FormStateEngine.executeAction(initialState, {
          type: 'ADD_COMPONENT',
          payload: { componentType: 'text_input', pageId: 'page1' }
        });

        currentState = FormStateEngine.executeAction(currentState, {
          type: 'ADD_COMPONENT',
          payload: { componentType: 'email_input', pageId: 'page1' }
        });

        const componentToDeleteId = currentState.pages[0].components[0].id;

        // Select the component to be deleted
        currentState = FormStateEngine.executeAction(currentState, {
          type: 'SELECT_COMPONENT',
          payload: { componentId: componentToDeleteId }
        });

        expect(currentState.selectedComponentId).toBe(componentToDeleteId);

        // Delete the selected component
        currentState = FormStateEngine.executeAction(currentState, {
          type: 'DELETE_COMPONENT',
          payload: { componentId: componentToDeleteId }
        });

        expect(currentState.pages[0].components).toHaveLength(1);
        expect(currentState.selectedComponentId).toBeNull(); // Should clear selection
      });
    });

    describe('Page State Mutations', () => {
      let initialState: any;

      beforeEach(() => {
        initialState = {
          pages: [{
            id: 'page1',
            title: 'Page 1',
            components: [],
            layout: {}
          }],
          currentPageId: 'page1',
          selectedComponentId: null,
          templateName: 'Test Form',
          templateId: null
        };
      });

      it('should handle page additions', () => {
        let currentState = FormStateEngine.executeAction(initialState, {
          type: 'ADD_PAGE',
          payload: { title: 'Page 2' }
        });

        expect(currentState.pages).toHaveLength(2);
        expect(currentState.pages[1].title).toBe('Page 2');
        expect(currentState.pages[1].components).toHaveLength(0);
      });

      it('should handle page switching with selection cleanup', () => {
        // Add a second page
        let currentState = FormStateEngine.executeAction(initialState, {
          type: 'ADD_PAGE',
          payload: { title: 'Page 2' }
        });

        // Add component to first page and select it
        currentState = FormStateEngine.executeAction(currentState, {
          type: 'ADD_COMPONENT',
          payload: { componentType: 'text_input', pageId: 'page1' }
        });

        const componentId = currentState.pages[0].components[0].id;
        currentState = FormStateEngine.executeAction(currentState, {
          type: 'SELECT_COMPONENT',
          payload: { componentId }
        });

        expect(currentState.selectedComponentId).toBe(componentId);

        // Switch to page 2
        const page2Id = currentState.pages[1].id;
        currentState = FormStateEngine.executeAction(currentState, {
          type: 'SWITCH_PAGE',
          payload: { pageId: page2Id }
        });

        expect(currentState.currentPageId).toBe(page2Id);
        expect(currentState.selectedComponentId).toBeNull(); // Should clear selection
      });

      it('should handle page title updates', () => {
        let currentState = FormStateEngine.executeAction(initialState, {
          type: 'UPDATE_PAGE_TITLE',
          payload: { pageId: 'page1', title: 'Updated Page Title' }
        });

        expect(currentState.pages[0].title).toBe('Updated Page Title');
      });

      it('should handle page deletion', () => {
        // Add second page
        let currentState = FormStateEngine.executeAction(initialState, {
          type: 'ADD_PAGE',
          payload: { title: 'Page 2' }
        });

        expect(currentState.pages).toHaveLength(2);

        // Delete first page
        currentState = FormStateEngine.executeAction(currentState, {
          type: 'DELETE_PAGE',
          payload: { pageId: 'page1' }
        });

        expect(currentState.pages).toHaveLength(1);
        expect(currentState.pages[0].title).toBe('Page 2');
        expect(currentState.currentPageId).toBe(currentState.pages[0].id);
      });
    });

    describe('Complex State Scenarios', () => {
      it('should handle clearing all components from multiple pages', () => {
        let currentState = {
          pages: [
            {
              id: 'page1',
              title: 'Page 1',
              components: [ComponentEngine.createComponent('text_input')],
              layout: {}
            },
            {
              id: 'page2',
              title: 'Page 2',
              components: [ComponentEngine.createComponent('email_input')],
              layout: {}
            }
          ],
          currentPageId: 'page1',
          selectedComponentId: null,
          templateName: 'Test Form',
          templateId: null
        };

        currentState = FormStateEngine.executeAction(currentState, {
          type: 'CLEAR_ALL_COMPONENTS',
          payload: {}
        });

        expect(currentState.pages[0].components).toHaveLength(0);
        expect(currentState.pages[1].components).toHaveLength(0);
        expect(currentState.selectedComponentId).toBeNull();
      });

      it('should handle template name and metadata updates', () => {
        let currentState = FormStateEngine.executeAction(initialState, {
          type: 'UPDATE_TEMPLATE_METADATA',
          payload: {
            templateName: 'New Form Name',
            templateId: 'form-123'
          }
        });

        expect(currentState.templateName).toBe('New Form Name');
        expect(currentState.templateId).toBe('form-123');
      });

      it('should handle bulk component operations', () => {
        let currentState = initialState;

        // Bulk add components
        const componentsData = [
          { type: 'text_input', label: 'First Name' },
          { type: 'text_input', label: 'Last Name' },
          { type: 'email_input', label: 'Email' }
        ];

        currentState = FormStateEngine.executeAction(currentState, {
          type: 'BULK_ADD_COMPONENTS',
          payload: { components: componentsData, pageId: 'page1' }
        });

        expect(currentState.pages[0].components).toHaveLength(3);
        expect(currentState.pages[0].components[0].label).toBe('First Name');
        expect(currentState.pages[0].components[1].label).toBe('Last Name');
        expect(currentState.pages[0].components[2].label).toBe('Email');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {

    it('should handle invalid action types gracefully', () => {
      const initialState = {
        pages: [{ id: 'page1', title: 'Page 1', components: [], layout: {} }],
        currentPageId: 'page1',
        selectedComponentId: null,
        templateName: 'Test Form',
        templateId: null
      };

      const result = FormStateEngine.executeAction(initialState, {
        type: 'UNKNOWN_ACTION',
        payload: {}
      });

      // Should return original state unchanged
      expect(result).toEqual(initialState);
    });

    it('should handle operations on non-existent components', () => {
      const initialState = {
        pages: [{ id: 'page1', title: 'Page 1', components: [], layout: {} }],
        currentPageId: 'page1',
        selectedComponentId: null,
        templateName: 'Test Form',
        templateId: null
      };

      const result = FormStateEngine.executeAction(initialState, {
        type: 'UPDATE_COMPONENT',
        payload: {
          componentId: 'nonexistent',
          updates: { label: 'Updated' }
        }
      });

      // Should return original state unchanged
      expect(result).toEqual(initialState);
    });

    it('should handle operations on non-existent pages', () => {
      const initialState = {
        pages: [{ id: 'page1', title: 'Page 1', components: [], layout: {} }],
        currentPageId: 'page1',
        selectedComponentId: null,
        templateName: 'Test Form',
        templateId: null
      };

      const result = FormStateEngine.executeAction(initialState, {
        type: 'SWITCH_PAGE',
        payload: { pageId: 'nonexistent' }
      });

      // Should return original state unchanged
      expect(result).toEqual(initialState);
    });

    it('should validate deeply nested layout structures', () => {
      const deepLayout = ComponentEngine.createComponent('vertical_layout');
      const middleLayout = ComponentEngine.createComponent('horizontal_layout');
      const innerComponent = ComponentEngine.createComponent('text_input');

      middleLayout.children = [innerComponent];
      deepLayout.children = [middleLayout];

      const validation = ComponentValidationEngine.validateComponent(deepLayout);
      expect(validation.valid).toBe(true);
    });

    it('should prevent infinite recursion in circular references', () => {
      const component1 = ComponentEngine.createComponent('vertical_layout');
      const component2 = ComponentEngine.createComponent('horizontal_layout');

      // Create circular reference
      component1.children = [component2];
      component2.children = [component1];

      // Should not cause infinite loop and should detect circular reference
      const validation = ComponentValidationEngine.validateComponent(component1);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Circular reference detected in layout components');
    });
  });
});