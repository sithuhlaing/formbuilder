/**
 * Comprehensive Business Logic Tests
 * Tests the actual business requirements and user workflows
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormBuilder } from '../features/form-builder/hooks/useFormBuilder';
import { DragDropService } from '../features/drag-drop/services/DragDropService';
import { ComponentEngine, FormStateEngine } from '../core';
import type { FormComponentData, ComponentType } from '../types/component';

describe('🎯 Business Logic Tests - Core Requirements', () => {

  describe('Form Builder Workflow - Complete User Journey', () => {
    let formBuilder: ReturnType<typeof useFormBuilder>;

    beforeEach(() => {
      const { result } = renderHook(() => useFormBuilder());
      formBuilder = result.current;
    });

    it('should support complete form building workflow', () => {
      const { result } = renderHook(() => useFormBuilder());

      act(() => {
        // Step 1: User adds text input
        result.current.addComponent('text_input');
      });

      expect(result.current.currentComponents).toHaveLength(1);
      expect(result.current.currentComponents[0].type).toBe('text_input');
      expect(result.current.selectedComponent).toBeTruthy();

      act(() => {
        // Step 2: User adds email input
        result.current.addComponent('email_input');
      });

      expect(result.current.currentComponents).toHaveLength(2);
      expect(result.current.currentComponents[1].type).toBe('email_input');

      act(() => {
        // Step 3: User updates first component
        const firstComponent = result.current.currentComponents[0];
        result.current.updateComponent(firstComponent.id, { 
          label: 'Full Name', 
          required: true 
        });
      });

      const updatedComponent = result.current.currentComponents[0];
      expect(updatedComponent.label).toBe('Full Name');
      expect(updatedComponent.required).toBe(true);

      act(() => {
        // Step 4: User deletes second component
        const secondComponent = result.current.currentComponents[1];
        result.current.deleteComponent(secondComponent.id);
      });

      expect(result.current.currentComponents).toHaveLength(1);
      expect(result.current.currentComponents[0].label).toBe('Full Name');

      // Workflow completed successfully ✅
    });

    it('should handle template naming correctly', () => {
      const { result } = renderHook(() => useFormBuilder());

      expect(result.current.formState.templateName).toBe('Untitled Form');

      act(() => {
        result.current.setTemplateName('User Registration Form');
      });

      expect(result.current.formState.templateName).toBe('User Registration Form');
    });
  });

  describe('Undo/Redo System - Critical Business Logic', () => {
    it('should track history correctly for all operations', () => {
      const { result } = renderHook(() => useFormBuilder());

      // Initial state - no undo/redo
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);

      // Add first component
      act(() => {
        result.current.addComponent('text_input');
      });

      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
      expect(result.current.currentComponents).toHaveLength(1);
      
      const firstComponentId = result.current.currentComponents[0].id;

      // Test undo after one addition
      act(() => {
        result.current.undo();
      });

      expect(result.current.currentComponents).toHaveLength(0);
      expect(result.current.canRedo).toBe(true);
      expect(result.current.canUndo).toBe(false);

      // Test redo
      act(() => {
        result.current.redo();
      });

      expect(result.current.currentComponents).toHaveLength(1);
      expect(result.current.currentComponents[0].type).toBe('text_input');
      expect(result.current.canRedo).toBe(false);

      // Undo/Redo working correctly ✅
    });

    it('should handle multiple operations with undo/redo', () => {
      const { result } = renderHook(() => useFormBuilder());

      // Add one component
      act(() => {
        result.current.addComponent('text_input');
      });

      expect(result.current.currentComponents).toHaveLength(1);
      const textInputComponent = result.current.currentComponents[0];

      // Update the component
      act(() => {
        result.current.updateComponent(textInputComponent.id, {
          label: 'Updated Label',
          required: true
        });
      });

      expect(result.current.currentComponents[0].label).toBe('Updated Label');
      expect(result.current.currentComponents[0].required).toBe(true);

      // Undo the update
      act(() => {
        result.current.undo();
      });

      expect(result.current.currentComponents[0].label).toBe('Text Input'); // Back to original
      expect(result.current.currentComponents[0].required).toBe(false);

      // Undo the add
      act(() => {
        result.current.undo();
      });

      expect(result.current.currentComponents).toHaveLength(0);

      // Redo add
      act(() => {
        result.current.redo();
      });

      expect(result.current.currentComponents).toHaveLength(1);
      expect(result.current.currentComponents[0].type).toBe('text_input');

      // Multiple undo/redo working correctly ✅
    });
  });

  describe('JSON Operations - Critical Business Requirements', () => {
    it('should export form data as JSON correctly', () => {
      const { result } = renderHook(() => useFormBuilder());

      act(() => {
        result.current.setTemplateName('Contact Form');
        result.current.addComponent('text_input');
      });

      expect(result.current.currentComponents).toHaveLength(1);
      const firstComponent = result.current.currentComponents[0];

      act(() => {
        result.current.updateComponent(firstComponent.id, { 
          label: 'Name', 
          required: true 
        });
      });

      const formData = {
        templateName: result.current.formState.templateName,
        pages: result.current.formState.pages
      };

      expect(formData.templateName).toBe('Contact Form');
      expect(formData.pages[0].components).toHaveLength(1);
      expect(formData.pages[0].components[0].label).toBe('Name');
      expect(formData.pages[0].components[0].required).toBe(true);
      expect(formData.pages[0].components[0].type).toBe('text_input');

      // JSON export structure is correct ✅
    });

    it('should load JSON data correctly', () => {
      const { result } = renderHook(() => useFormBuilder());

      const sampleFormData = {
        templateName: 'Loaded Form',
        pages: [
          {
            id: 'page1',
            title: 'Page 1',
            components: [
              {
                id: 'comp1',
                type: 'text_input',
                label: 'First Name',
                required: true,
                fieldId: 'firstName',
                placeholder: 'Enter your first name'
              },
              {
                id: 'comp2', 
                type: 'select',
                label: 'Country',
                required: false,
                fieldId: 'country',
                options: ['USA', 'Canada', 'UK']
              }
            ],
            layout: {}
          }
        ]
      };

      act(() => {
        result.current.loadFromJSON(JSON.stringify(sampleFormData));
      });

      expect(result.current.formState.templateName).toBe('Loaded Form');
      expect(result.current.currentComponents).toHaveLength(2);
      expect(result.current.currentComponents[0].label).toBe('First Name');
      expect(result.current.currentComponents[0].required).toBe(true);
      expect(result.current.currentComponents[1].type).toBe('select');
      expect(result.current.currentComponents[1].options).toEqual(['USA', 'Canada', 'UK']);

      // JSON loading working correctly ✅
    });

    it('should handle invalid JSON gracefully', () => {
      const { result } = renderHook(() => useFormBuilder());
      
      const originalConsoleError = console.error;
      const consoleLogs: string[] = [];
      console.error = (...args) => {
        consoleLogs.push(args.join(' '));
      };

      act(() => {
        // Test invalid JSON string
        result.current.loadFromJSON('invalid json');
      });

      // Should not crash, should keep original state
      expect(result.current.formState.templateName).toBe('Untitled Form');
      expect(result.current.currentComponents).toHaveLength(0);
      expect(consoleLogs.some(log => log.includes('Failed to load JSON'))).toBe(true);

      console.error = originalConsoleError;

      // Error handling working correctly ✅
    });
  });

  describe('Clear All Functionality', () => {
    it('should clear all components and reset selection', () => {
      const { result } = renderHook(() => useFormBuilder());

      act(() => {
        // Add one component
        result.current.addComponent('text_input');
      });

      expect(result.current.currentComponents).toHaveLength(1);
      expect(result.current.selectedComponent).toBeTruthy();

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.currentComponents).toHaveLength(0);
      expect(result.current.selectedComponent).toBe(null);
      expect(result.current.canUndo).toBe(true); // Should be able to undo clear

      // Clear all working correctly ✅
    });
  });

  describe('Component Selection Logic', () => {
    it('should handle component selection correctly', () => {
      const { result } = renderHook(() => useFormBuilder());

      act(() => {
        result.current.addComponent('text_input');
      });

      expect(result.current.currentComponents).toHaveLength(1);
      const firstComponent = result.current.currentComponents[0];

      // Component should be automatically selected when added
      expect(result.current.selectedComponent?.id).toBe(firstComponent.id);

      act(() => {
        result.current.selectComponent(null);
      });

      expect(result.current.selectedComponent).toBe(null);

      act(() => {
        result.current.selectComponent(firstComponent.id);
      });

      expect(result.current.selectedComponent?.id).toBe(firstComponent.id);

      // Component selection working correctly ✅
    });
  });
});

describe('🔄 Drag Drop Business Logic', () => {
  describe('DragDropService Core Operations', () => {
    let testComponents: FormComponentData[];
    let mockCreateComponent: (type: ComponentType) => FormComponentData;

    beforeEach(() => {
      testComponents = [
        {
          id: 'test1',
          type: 'text_input',
          label: 'Text Input',
          fieldId: 'field1',
          required: false,
          placeholder: 'Enter text...'
        },
        {
          id: 'test2', 
          type: 'email_input',
          label: 'Email Input',
          fieldId: 'field2',
          required: false,
          placeholder: 'Enter email...'
        }
      ];

      mockCreateComponent = (type: ComponentType): FormComponentData => ({
        id: `mock_${Date.now()}`,
        type,
        label: `Mock ${type}`,
        fieldId: `mock_field_${Date.now()}`,
        required: false,
        placeholder: 'Mock placeholder'
      });
    });

    it('should insert component before target correctly', () => {
      const position = {
        type: 'before' as const,
        targetId: testComponents[1].id,
        componentType: 'textarea' as ComponentType
      };

      const result = DragDropService.handleDrop(
        testComponents,
        position,
        mockCreateComponent
      );

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('text_input');
      expect(result[1].type).toBe('textarea'); // Inserted before email
      expect(result[2].type).toBe('email_input');

      // Before insertion working correctly ✅
    });

    it('should insert component after target correctly', () => {
      const position = {
        type: 'after' as const,
        targetId: testComponents[0].id,
        componentType: 'select' as ComponentType
      };

      const result = DragDropService.handleDrop(
        testComponents,
        position,
        mockCreateComponent
      );

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('text_input');
      expect(result[1].type).toBe('select'); // Inserted after text input
      expect(result[2].type).toBe('email_input');

      // After insertion working correctly ✅
    });

    it('should create horizontal layout correctly', () => {
      const position = {
        type: 'left' as const,
        targetId: testComponents[0].id,
        componentType: 'number_input' as ComponentType
      };

      const result = DragDropService.handleDrop(
        testComponents,
        position,
        mockCreateComponent
      );

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('horizontal_layout');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children![0].type).toBe('number_input'); // Left side
      expect(result[0].children![1].type).toBe('text_input'); // Original component
      expect(result[1].type).toBe('email_input'); // Unchanged

      // Horizontal layout creation working correctly ✅
    });

    it('should handle right insertion correctly', () => {
      const position = {
        type: 'right' as const,
        targetId: testComponents[1].id,
        componentType: 'checkbox' as ComponentType
      };

      const result = DragDropService.handleDrop(
        testComponents,
        position,
        mockCreateComponent
      );

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('text_input'); // Unchanged
      expect(result[1].type).toBe('horizontal_layout');
      expect(result[1].children![0].type).toBe('email_input'); // Original
      expect(result[1].children![1].type).toBe('checkbox'); // Right side

      // Right insertion working correctly ✅
    });

    it('should validate drop operations', () => {
      expect(DragDropService.canDrop('valid-id', 'text_input')).toBe(true);
      expect(DragDropService.canDrop('', 'text_input')).toBe(false);
      expect(DragDropService.canDrop('valid-id', '' as any)).toBe(false);

      // Drop validation working correctly ✅
    });
  });

  describe('Drag Drop Integration with Form Builder', () => {
    it('should handle empty canvas drop', () => {
      const { result } = renderHook(() => useFormBuilder());

      act(() => {
        // Drop on empty canvas
        result.current.handleDrop('text_input', 'empty-canvas', 'after');
      });

      expect(result.current.currentComponents).toHaveLength(1);
      expect(result.current.currentComponents[0].type).toBe('text_input');

      // Empty canvas drop working correctly ✅
    });

    it('should handle drop between existing components', () => {
      const { result } = renderHook(() => useFormBuilder());

      act(() => {
        result.current.addComponent('text_input');
      });

      expect(result.current.currentComponents).toHaveLength(1);
      const firstComponentId = result.current.currentComponents[0].id;

      act(() => {
        // Drop textarea after first component
        result.current.handleDrop('textarea', firstComponentId, 'after');
      });

      expect(result.current.currentComponents).toHaveLength(2);
      expect(result.current.currentComponents[0].type).toBe('text_input');
      expect(result.current.currentComponents[1].type).toBe('textarea'); // Inserted

      // Drop between components working correctly ✅
    });
  });
});

describe('🔍 Form Validation Business Logic', () => {
  describe('Component Validation', () => {
    it('should validate required fields correctly', () => {
      const validComponent = ComponentEngine.createComponent('text_input');
      const validation = ComponentEngine.validateComponent(validComponent);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      const invalidComponent = { ...validComponent, label: '' };
      const invalidValidation = ComponentEngine.validateComponent(invalidComponent);
      
      expect(invalidValidation.valid).toBe(false);
      expect(invalidValidation.errors).toContain('Label is required');
    });

    it('should validate select components with options', () => {
      const selectComponent = ComponentEngine.createComponent('select');
      const validation = ComponentEngine.validateComponent(selectComponent);
      
      expect(validation.valid).toBe(true); // Has default options

      const invalidSelect = { ...selectComponent, options: [] };
      const invalidValidation = ComponentEngine.validateComponent(invalidSelect);
      
      expect(invalidValidation.valid).toBe(false);
      expect(invalidValidation.errors).toContain('At least one option is required');
    });

    it('should validate number input constraints', () => {
      const numberComponent = ComponentEngine.createComponent('number_input');
      numberComponent.min = 10;
      numberComponent.max = 5; // Invalid: min > max
      
      const validation = ComponentEngine.validateComponent(numberComponent);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Minimum value must be less than maximum value');
    });
  });

  describe('Form State Validation', () => {
    it('should validate complete form state', () => {
      const validPages = [
        { 
          id: 'page1', 
          title: 'Page 1', 
          components: [ComponentEngine.createComponent('text_input')], 
          layout: {} 
        }
      ];

      const validation = FormStateEngine.validateFormState(validPages);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should require at least one page', () => {
      const validation = FormStateEngine.validateFormState([]);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Form must have at least one page');
    });

    it('should require page titles', () => {
      const invalidPages = [
        { id: 'page1', title: '', components: [], layout: {} }
      ];

      const validation = FormStateEngine.validateFormState(invalidPages);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Page 1 must have a title');
    });
  });
});

describe('🏆 End-to-End Business Scenarios', () => {
  it('should handle complete form creation workflow', () => {
    const { result } = renderHook(() => useFormBuilder());

    // Step 1: Set form name
    act(() => {
      result.current.setTemplateName('Customer Feedback Form');
      result.current.addComponent('text_input');
    });

    expect(result.current.formState.templateName).toBe('Customer Feedback Form');
    expect(result.current.currentComponents).toHaveLength(1);
    
    const nameField = result.current.currentComponents[0];

    // Step 2: Update the component
    act(() => {
      result.current.updateComponent(nameField.id, {
        label: 'Full Name',
        required: true,
        placeholder: 'Enter your full name'
      });
    });
    
    expect(result.current.currentComponents[0].label).toBe('Full Name');
    expect(result.current.currentComponents[0].required).toBe(true);
    expect(result.current.currentComponents[0].placeholder).toBe('Enter your full name');

    // Validate the form
    const validation = FormStateEngine.validateFormState(result.current.formState.pages);
    expect(validation.valid).toBe(true);

    // End-to-end workflow completed successfully ✅
  });

  it('should handle form editing and recovery workflow', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      // Add one component
      result.current.addComponent('text_input');
    });

    expect(result.current.currentComponents).toHaveLength(1);
    const originalComponent = result.current.currentComponents[0];

    act(() => {
      // User updates component
      result.current.updateComponent(originalComponent.id, {
        label: 'Customer Name',
        required: true
      });
    });

    expect(result.current.currentComponents[0].label).toBe('Customer Name');
    expect(result.current.currentComponents[0].required).toBe(true);

    act(() => {
      // User accidentally deletes the component
      result.current.deleteComponent(originalComponent.id);
    });

    expect(result.current.currentComponents).toHaveLength(0);

    act(() => {
      // User realizes mistake and undoes
      result.current.undo();
    });

    expect(result.current.currentComponents).toHaveLength(1);
    expect(result.current.currentComponents[0].label).toBe('Customer Name'); // Restored with updates
    expect(result.current.currentComponents[0].required).toBe(true);

    // Form editing and recovery workflow completed successfully ✅
  });
});