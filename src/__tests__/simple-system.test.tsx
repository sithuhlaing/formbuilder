/**
 * Test Suite for Simplified Form Builder System
 * Validates Phase 1 implementation before migration
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSimpleFormBuilder, useSelectedComponent } from '../hooks/useSimpleFormBuilder';
import { createComponent, validateComponent, cloneComponent } from '../core/componentUtils';
import type { ComponentType } from '../types/components';

describe('Simplified Form Builder System - Phase 1', () => {
  
  describe('Simple Component Factory', () => {
    it('should create text input with correct defaults', () => {
      const component = createComponent('text_input');
      
      expect(component.id).toBeDefined();
      expect(component.type).toBe('text_input');
      expect(component.label).toBe('Text Input');
      expect(component.placeholder).toBe('Enter text here...');
      expect(component.required).toBe(false);
      expect(component.validation?.required).toBe(false);
    });

    it('should create email input with validation pattern', () => {
      const component = createComponent('email_input');
      
      expect(component.type).toBe('email_input');
      expect(component.validation?.pattern).toBe('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
      expect(component.validation?.message).toContain('valid email');
    });

    it('should create select with default options', () => {
      const component = createComponent('select');
      
      expect(component.options).toHaveLength(3);
      expect(component.options?.[0]).toEqual({ label: 'Option 1', value: 'option1' });
    });

    it('should create layout with children array', () => {
      const horizontal = createComponent('horizontal_layout');
      const vertical = createComponent('vertical_layout');
      
      expect(horizontal.children).toEqual([]);
      expect(vertical.children).toEqual([]);
      expect(horizontal.className).toContain('horizontal');
      expect(vertical.className).toContain('vertical');
    });
  });

  describe('Simple Validation', () => {
    it('should validate required fields correctly', () => {
      const component = createComponent('text_input');
      component.validation = { required: true };
      
      const validResult = validateComponent(component, 'Some value');
      const invalidResult = validateComponent(component, '');
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.message).toContain('required');
    });

    it('should validate email pattern', () => {
      const component = createComponent('email_input');
      
      const validResult = validateComponent(component, 'test@example.com');
      const invalidResult = validateComponent(component, 'invalid-email');
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.message).toContain('valid email');
    });

    it('should validate length constraints', () => {
      const component = createComponent('text_input');
      component.validation = { minLength: 3, maxLength: 10 };
      
      const tooShort = validateComponent(component, 'hi');
      const tooLong = validateComponent(component, 'this is too long');
      const justRight = validateComponent(component, 'perfect');
      
      expect(tooShort.isValid).toBe(false);
      expect(tooLong.isValid).toBe(false);
      expect(justRight.isValid).toBe(true);
    });
  });

  describe('Component Cloning', () => {
    it('should clone component with new ID', () => {
      const original = createComponent('text_input');
      const cloned = cloneComponent(original);
      
      expect(cloned.id).not.toBe(original.id);
      expect(cloned.label).toBe(`${original.label} (Copy)`);
      expect(cloned.type).toBe(original.type);
    });

    it('should deep clone children for layouts', () => {
      const layout = createComponent('horizontal_layout');
      const child1 = createComponent('text_input');
      const child2 = createComponent('select');
      layout.children = [child1, child2];
      
      const cloned = cloneComponent(layout);
      
      expect(cloned.children).toHaveLength(2);
      expect(cloned.children?.[0].id).not.toBe(child1.id);
      expect(cloned.children?.[1].id).not.toBe(child2.id);
    });
  });

  describe('Simplified Form Builder Hook', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      expect(result.current.components).toEqual([]);
      expect(result.current.selectedId).toBeNull();
      expect(result.current.templateName).toBe('Untitled Form');
      expect(result.current.history).toEqual([]);
      expect(result.current.historyIndex).toBe(-1);
    });

    it('should add components correctly', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      act(() => {
        result.current.addComponent('text_input');
      });
      
      expect(result.current.components).toHaveLength(1);
      expect(result.current.components[0].type).toBe('text_input');
      expect(result.current.selectedId).toBe(result.current.components[0].id);
    });

    it('should update components correctly', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      act(() => {
        result.current.addComponent('text_input');
      });
      
      const componentId = result.current.components[0].id;
      
      act(() => {
        result.current.updateComponent(componentId, { 
          label: 'Updated Label',
          required: true 
        });
      });
      
      expect(result.current.components[0].label).toBe('Updated Label');
      expect(result.current.components[0].required).toBe(true);
    });

    it('should delete components correctly', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      act(() => {
        result.current.addComponent('text_input');
        result.current.addComponent('select');
      });
      
      // The currently selected component is the last added (select)
      const selectedId = result.current.selectedId;
      
      act(() => {
        result.current.deleteComponent(selectedId!);
      });
      
      expect(result.current.components).toHaveLength(1);
      expect(result.current.components[0].type).toBe('text_input');
      expect(result.current.selectedId).toBeNull(); // Should clear if deleted component was selected
    });

    it('should handle undo/redo correctly', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Initial state
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(false);
      
      // Add component
      act(() => {
        result.current.addComponent('text_input');
      });
      
      expect(result.current.components).toHaveLength(1);
      expect(result.current.canUndo()).toBe(true);
      expect(result.current.canRedo()).toBe(false);
      
      // Undo - should go back to empty state
      act(() => {
        result.current.undo();
      });
      
      expect(result.current.components).toHaveLength(0);
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(true);
      
      // Redo - should restore the component
      act(() => {
        result.current.redo();
      });
      
      expect(result.current.components).toHaveLength(1);
      expect(result.current.canUndo()).toBe(true);
      expect(result.current.canRedo()).toBe(false);
    });

    it('should handle component movement', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      act(() => {
        result.current.addComponent('text_input');
        result.current.addComponent('select');
        result.current.addComponent('checkbox');
      });
      
      const originalOrder = result.current.components.map(c => c.type);
      expect(originalOrder).toEqual(['text_input', 'select', 'checkbox']);
      
      act(() => {
        result.current.moveComponent(0, 2); // Move first to last
      });
      
      const newOrder = result.current.components.map(c => c.type);
      expect(newOrder).toEqual(['select', 'checkbox', 'text_input']);
    });

    it('should handle JSON export/import', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      act(() => {
        result.current.addComponent('text_input');
        result.current.addComponent('select');
        result.current.setTemplateName('Test Form');
      });
      
      const exportedJSON = result.current.exportJSON();
      const parsedData = JSON.parse(exportedJSON);
      
      expect(parsedData.templateName).toBe('Test Form');
      expect(parsedData.components).toHaveLength(2);
      expect(parsedData.version).toBe('2.0-simplified');
      
      // Clear and import
      act(() => {
        result.current.clearAll();
      });
      
      expect(result.current.components).toHaveLength(0);
      
      act(() => {
        result.current.importJSON(exportedJSON);
      });
      
      expect(result.current.components).toHaveLength(2);
      expect(result.current.templateName).toBe('Test Form');
    });
  });

  describe('Selected Component Hook', () => {
    it('should return null when nothing selected', () => {
      const { result: formResult } = renderHook(() => useSimpleFormBuilder());
      const { result: selectedResult } = renderHook(() => 
        useSelectedComponent(formResult.current)
      );
      
      expect(selectedResult.current).toBeNull();
    });

    it('should return selected component', () => {
      const { result: formResult } = renderHook(() => useSimpleFormBuilder());
      
      act(() => {
        formResult.current.addComponent('text_input');
      });
      
      const { result: selectedResult } = renderHook(() => 
        useSelectedComponent(formResult.current)
      );
      
      expect(selectedResult.current?.type).toBe('text_input');
      expect(selectedResult.current?.id).toBe(formResult.current.components[0].id);
    });
  });

  describe('Performance & Memory', () => {
    it('should limit history to prevent memory issues', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Add many components to test history limit
      act(() => {
        for (let i = 0; i < 60; i++) {
          result.current.addComponent('text_input');
        }
      });
      
      // History should be limited to 50 states
      expect(result.current.history.length).toBeLessThanOrEqual(50);
    });

    it('should handle large component trees efficiently', () => {
      const { result } = renderHook(() => useSimpleFormBuilder());
      
      // Create nested layout structure
      act(() => {
        result.current.addComponent('vertical_layout');
        // In a real scenario, we'd add children to layouts
        // This is a basic test to ensure no performance issues
        for (let i = 0; i < 20; i++) {
          result.current.addComponent('text_input');
        }
      });
      
      expect(result.current.components).toHaveLength(21);
      
      // Should be able to update any component quickly
      const startTime = performance.now();
      act(() => {
        result.current.updateComponent(
          result.current.components[10].id,
          { label: 'Updated' }
        );
      });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });
  });
});

// Integration test to ensure compatibility
describe('System Integration', () => {
  it('should work with all component types', () => {
    const componentTypes: ComponentType[] = [
      'text_input', 'email_input', 'number_input', 'textarea',
      'select', 'radio_group', 'checkbox',
      'date_picker', 'file_upload',
      'horizontal_layout', 'vertical_layout',
      'button', 'heading', 'paragraph'
    ];

    const { result } = renderHook(() => useSimpleFormBuilder());

    act(() => {
      componentTypes.forEach(type => {
        result.current.addComponent(type);
      });
    });

    expect(result.current.components).toHaveLength(componentTypes.length);
    
    // Each component should have correct type and valid ID
    result.current.components.forEach((component, index) => {
      expect(component.type).toBe(componentTypes[index]);
      expect(component.id).toBeDefined();
      expect(component.label).toBeDefined();
    });
  });
});