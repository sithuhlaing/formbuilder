/**
 * Comprehensive Core Engines Test Suite
 * Designed to achieve 100% code coverage for critical core modules
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentEngine } from '../core/ComponentEngine';
import { FormStateEngine } from '../core/FormStateEngine';
import { ComponentValidationEngine } from '../core/ComponentValidationEngine';
import { DragDropLogic } from '../core/DragDropLogic';
import type { FormComponentData, ComponentType } from '../types/component';

describe('🏗️ Core Engines - Comprehensive Coverage', () => {

  describe('ComponentEngine - Complete Coverage', () => {
    
    it('should create all component types with correct defaults', () => {
      const componentTypes: ComponentType[] = [
        'text_input', 'email_input', 'password_input', 'number_input',
        'textarea', 'rich_text', 'select', 'multi_select',
        'checkbox', 'radio_group', 'date_picker', 'file_upload',
        'signature', 'section_divider', 'horizontal_layout', 'vertical_layout'
      ];

      componentTypes.forEach(type => {
        const component = ComponentEngine.createComponent(type);
        
        expect(component.id).toBeDefined();
        expect(component.type).toBe(type);
        expect(component.fieldId).toBeDefined();
        expect(typeof component.required).toBe('boolean');
        expect(component.label).toBeDefined();
        
        // Type-specific assertions
        if (['select', 'multi_select', 'radio_group'].includes(type)) {
          expect(component.options).toBeDefined();
          expect(Array.isArray(component.options)).toBe(true);
        }
        
        if (type === 'number_input') {
          expect(component.min).toBeDefined();
          expect(component.max).toBeDefined();
        }
        
        if (type === 'textarea') {
          expect(component.rows).toBeDefined();
        }
        
        if (['horizontal_layout', 'vertical_layout'].includes(type)) {
          expect(component.children).toBeDefined();
          expect(Array.isArray(component.children)).toBe(true);
        }
      });
    });

    it('should handle component updates correctly', () => {
      const component = ComponentEngine.createComponent('text_input');
      
      const updatedComponent = ComponentEngine.updateComponent(component, {
        label: 'Updated Label',
        required: true,
        placeholder: 'New placeholder'
      });

      expect(updatedComponent.label).toBe('Updated Label');
      expect(updatedComponent.required).toBe(true);
      expect(updatedComponent.placeholder).toBe('New placeholder');
      expect(updatedComponent.id).toBe(component.id); // ID should remain same
    });

    it('should validate component data correctly', () => {
      // Valid component
      const validComponent = ComponentEngine.createComponent('text_input');
      const validResult = ComponentEngine.validateComponent(validComponent);
      
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      // Invalid component - missing required fields
      const invalidComponent = { ...validComponent, label: '' };
      const invalidResult = ComponentEngine.validateComponent(invalidComponent);
      
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });

    it('should find components by ID recursively', () => {
      const childComponent = ComponentEngine.createComponent('text_input');
      const layoutComponent = ComponentEngine.createComponent('horizontal_layout');
      layoutComponent.children = [childComponent];
      
      const components = [layoutComponent];
      
      const found = ComponentEngine.findComponentById(components, childComponent.id);
      expect(found).toEqual(childComponent);

      const notFound = ComponentEngine.findComponentById(components, 'nonexistent');
      expect(notFound).toBeNull();
    });

    it('should handle deep component structures', () => {
      const deeplyNested = ComponentEngine.createComponent('vertical_layout');
      const middleLayout = ComponentEngine.createComponent('horizontal_layout');
      const innerComponent = ComponentEngine.createComponent('text_input');
      
      middleLayout.children = [innerComponent];
      deeplyNested.children = [middleLayout];
      
      const found = ComponentEngine.findComponentById([deeplyNested], innerComponent.id);
      expect(found).toEqual(innerComponent);
    });

    it('should handle component cloning', () => {
      const original = ComponentEngine.createComponent('select');
      original.options = [{ label: 'Option 1', value: 'opt1' }];
      
      const cloned = ComponentEngine.cloneComponent(original);
      
      expect(cloned.id).not.toBe(original.id); // Should have new ID
      expect(cloned.type).toBe(original.type);
      expect(cloned.options).toEqual(original.options);
    });
  });

  describe('FormStateEngine - Complete Coverage', () => {
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

    it('should execute ADD_COMPONENT action', () => {
      const action = {
        type: 'ADD_COMPONENT',
        payload: { componentType: 'text_input', pageId: 'page1' }
      };

      const newState = FormStateEngine.executeAction(initialState, action);
      
      expect(newState.pages[0].components).toHaveLength(1);
      expect(newState.pages[0].components[0].type).toBe('text_input');
      expect(newState.selectedComponentId).toBe(newState.pages[0].components[0].id);
    });

    it('should execute UPDATE_COMPONENT action', () => {
      // First add a component
      const addAction = {
        type: 'ADD_COMPONENT',
        payload: { componentType: 'text_input', pageId: 'page1' }
      };
      const stateWithComponent = FormStateEngine.executeAction(initialState, addAction);
      const componentId = stateWithComponent.pages[0].components[0].id;

      // Then update it
      const updateAction = {
        type: 'UPDATE_COMPONENT',
        payload: { 
          componentId, 
          updates: { label: 'Updated Label', required: true }
        }
      };
      const updatedState = FormStateEngine.executeAction(stateWithComponent, updateAction);

      const updatedComponent = updatedState.pages[0].components[0];
      expect(updatedComponent.label).toBe('Updated Label');
      expect(updatedComponent.required).toBe(true);
    });

    it('should execute DELETE_COMPONENT action', () => {
      // First add a component
      const addAction = {
        type: 'ADD_COMPONENT',
        payload: { componentType: 'text_input', pageId: 'page1' }
      };
      const stateWithComponent = FormStateEngine.executeAction(initialState, addAction);
      const componentId = stateWithComponent.pages[0].components[0].id;

      // Then delete it
      const deleteAction = {
        type: 'DELETE_COMPONENT',
        payload: { componentId }
      };
      const stateAfterDelete = FormStateEngine.executeAction(stateWithComponent, deleteAction);

      expect(stateAfterDelete.pages[0].components).toHaveLength(0);
      expect(stateAfterDelete.selectedComponentId).toBeNull();
    });

    it('should execute SELECT_COMPONENT action', () => {
      // First add a component
      const addAction = {
        type: 'ADD_COMPONENT',
        payload: { componentType: 'text_input', pageId: 'page1' }
      };
      const stateWithComponent = FormStateEngine.executeAction(initialState, addAction);
      const componentId = stateWithComponent.pages[0].components[0].id;

      // Then select it explicitly
      const selectAction = {
        type: 'SELECT_COMPONENT',
        payload: { componentId }
      };
      const stateWithSelection = FormStateEngine.executeAction(stateWithComponent, selectAction);

      expect(stateWithSelection.selectedComponentId).toBe(componentId);
    });

    it('should handle MOVE_COMPONENT action', () => {
      // Add two components
      const state1 = FormStateEngine.executeAction(initialState, {
        type: 'ADD_COMPONENT',
        payload: { componentType: 'text_input', pageId: 'page1' }
      });
      const state2 = FormStateEngine.executeAction(state1, {
        type: 'ADD_COMPONENT',
        payload: { componentType: 'email_input', pageId: 'page1' }
      });

      // Move first component to second position
      const moveAction = {
        type: 'MOVE_COMPONENT',
        payload: {
          pageId: 'page1',
          fromIndex: 0,
          toIndex: 1
        }
      };
      const movedState = FormStateEngine.executeAction(state2, moveAction);

      expect(movedState.pages[0].components[0].type).toBe('email_input');
      expect(movedState.pages[0].components[1].type).toBe('text_input');
    });

    it('should handle ADD_PAGE action', () => {
      const action = {
        type: 'ADD_PAGE',
        payload: { title: 'Page 2' }
      };

      const newState = FormStateEngine.executeAction(initialState, action);
      
      expect(newState.pages).toHaveLength(2);
      expect(newState.pages[1].title).toBe('Page 2');
    });

    it('should handle SWITCH_PAGE action', () => {
      // First add a page
      const addPageState = FormStateEngine.executeAction(initialState, {
        type: 'ADD_PAGE',
        payload: { title: 'Page 2' }
      });

      // Then switch to it
      const switchAction = {
        type: 'SWITCH_PAGE',
        payload: { pageId: addPageState.pages[1].id }
      };
      const switchedState = FormStateEngine.executeAction(addPageState, switchAction);

      expect(switchedState.currentPageId).toBe(addPageState.pages[1].id);
    });

    it('should validate form state', () => {
      const validPages = [{
        id: 'page1',
        title: 'Valid Page',
        components: [],
        layout: {}
      }];

      const validation = FormStateEngine.validateFormState(validPages);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Test invalid form state
      const invalidPages: any[] = [];
      const invalidValidation = FormStateEngine.validateFormState(invalidPages);
      expect(invalidValidation.valid).toBe(false);
      expect(invalidValidation.errors).toContain('Form must have at least one page');
    });

    it('should get current page components', () => {
      const component = ComponentEngine.createComponent('text_input');
      const pages = [{
        id: 'page1',
        title: 'Page 1',
        components: [component],
        layout: {}
      }];

      const components = FormStateEngine.getCurrentPageComponents(pages, 'page1');
      expect(components).toHaveLength(1);
      expect(components[0]).toEqual(component);

      // Test non-existent page
      const emptyComponents = FormStateEngine.getCurrentPageComponents(pages, 'nonexistent');
      expect(emptyComponents).toHaveLength(0);
    });
  });

  describe('ComponentValidationEngine - Complete Coverage', () => {
    
    it('should validate required fields', () => {
      const component = ComponentEngine.createComponent('text_input');
      component.required = true;

      const validation = ComponentValidationEngine.validateComponent(component);
      expect(validation.valid).toBe(true);

      // Test invalid required field
      const invalidComponent = { ...component, label: '' };
      const invalidValidation = ComponentValidationEngine.validateComponent(invalidComponent);
      expect(invalidValidation.valid).toBe(false);
    });

    it('should validate select components with options', () => {
      const selectComponent = ComponentEngine.createComponent('select');
      
      // Valid select with options
      const validation = ComponentValidationEngine.validateComponent(selectComponent);
      expect(validation.valid).toBe(true);

      // Invalid select without options
      const invalidSelect = { ...selectComponent, options: [] };
      const invalidValidation = ComponentValidationEngine.validateComponent(invalidSelect);
      expect(invalidValidation.valid).toBe(false);
      expect(invalidValidation.errors).toContain('At least one option is required');
    });

    it('should validate number input constraints', () => {
      const numberComponent = ComponentEngine.createComponent('number_input');
      numberComponent.min = 10;
      numberComponent.max = 5; // Invalid: min > max

      const validation = ComponentValidationEngine.validateComponent(numberComponent);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Minimum value must be less than maximum value');
    });

    it('should validate layout components', () => {
      const layoutComponent = ComponentEngine.createComponent('horizontal_layout');
      
      const validation = ComponentValidationEngine.validateComponent(layoutComponent);
      expect(validation.valid).toBe(true);
    });

    it('should handle validation errors gracefully', () => {
      const malformedComponent: any = {
        id: 'test',
        type: 'unknown_type',
        label: null
      };

      const validation = ComponentValidationEngine.validateComponent(malformedComponent);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('DragDropLogic - Complete Coverage', () => {
    let components: FormComponentData[];
    let dragDropLogic: DragDropLogic;

    beforeEach(() => {
      components = [
        ComponentEngine.createComponent('text_input'),
        ComponentEngine.createComponent('email_input')
      ];
      dragDropLogic = new DragDropLogic();
    });

    it('should handle drop before position', () => {
      const newComponent = ComponentEngine.createComponent('password_input');
      
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'before',
          targetId: components[0].id,
          componentType: 'password_input'
        },
        () => newComponent
      );

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('password_input');
      expect(result[1].id).toBe(components[0].id);
    });

    it('should handle drop after position', () => {
      const newComponent = ComponentEngine.createComponent('password_input');
      
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'after',
          targetId: components[0].id,
          componentType: 'password_input'
        },
        () => newComponent
      );

      expect(result).toHaveLength(3);
      expect(result[1].type).toBe('password_input');
    });

    it('should handle horizontal layout creation', () => {
      const newComponent = ComponentEngine.createComponent('password_input');
      
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'left',
          targetId: components[0].id,
          componentType: 'password_input'
        },
        () => newComponent
      );

      expect(result).toHaveLength(2); // One less component, one layout added
      expect(result[0].type).toBe('horizontal_layout');
      expect(result[0].children).toHaveLength(2);
    });

    it('should handle component repositioning', () => {
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'after',
          targetId: components[0].id,
          componentType: 'email_input',
          dragType: 'existing-item',
          sourceId: components[1].id
        },
        () => ComponentEngine.createComponent('email_input')
      );

      expect(result).toHaveLength(2);
      expect(result[1].id).toBe(components[1].id); // Second component moved after first
    });

    it('should handle center drop', () => {
      const newComponent = ComponentEngine.createComponent('password_input');
      
      const result = dragDropLogic.handleDrop(
        [],
        {
          type: 'center',
          targetId: '',
          componentType: 'password_input'
        },
        () => newComponent
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('password_input');
    });

    it('should handle inside drop for layout components', () => {
      const layoutComponent = ComponentEngine.createComponent('horizontal_layout');
      const newComponent = ComponentEngine.createComponent('text_input');
      
      const result = dragDropLogic.handleDrop(
        [layoutComponent],
        {
          type: 'inside',
          targetId: layoutComponent.id,
          componentType: 'text_input'
        },
        () => newComponent
      );

      expect(result[0].children).toHaveLength(1);
      expect(result[0].children![0].type).toBe('text_input');
    });

    it('should handle unknown drop positions gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'unknown' as any,
          targetId: components[0].id,
          componentType: 'text_input'
        },
        () => ComponentEngine.createComponent('text_input')
      );

      expect(result).toEqual(components); // Should return original components
      expect(consoleSpy).toHaveBeenCalledWith('❌ Unknown drop position:', 'unknown');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    
    it('should handle null/undefined inputs gracefully', () => {
      expect(() => {
        ComponentEngine.createComponent(null as any);
      }).toThrow();

      expect(() => {
        FormStateEngine.executeAction(null as any, null as any);
      }).toThrow();
    });

    it('should handle malformed component data', () => {
      const malformed: any = { id: 'test' }; // Missing required fields
      
      const validation = ComponentValidationEngine.validateComponent(malformed);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should handle circular references in components', () => {
      const component1 = ComponentEngine.createComponent('horizontal_layout');
      const component2 = ComponentEngine.createComponent('vertical_layout');
      
      // Create circular reference
      component1.children = [component2];
      component2.children = [component1];

      // Should not cause infinite loop
      expect(() => {
        ComponentEngine.findComponentById([component1], 'nonexistent');
      }).not.toThrow();
    });
  });
});