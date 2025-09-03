/**
 * Comprehensive Drag-Drop Operations Test Suite
 * Covers all drag-drop scenarios, position detection, and layout transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DragDropLogic } from '../core/DragDropLogic';
import { ComponentEngine } from '../core/ComponentEngine';
import type { FormComponentData, DropPosition } from '../types/component';

describe('🎯 Drag-Drop Operations - Complete Coverage', () => {

  let dragDropLogic: DragDropLogic;
  let components: FormComponentData[];

  beforeEach(() => {
    dragDropLogic = new DragDropLogic({
      enableHorizontalLayouts: true,
      enableVerticalReordering: true,
      enableCrossLayoutMovement: true,
      autoDissolveEmptyLayouts: true
    });

    components = [
      ComponentEngine.createComponent('text_input'),
      ComponentEngine.createComponent('email_input'),
      ComponentEngine.createComponent('select')
    ];
  });

  describe('Basic Drop Operations', () => {

    it('should handle drop before position', () => {
      const newComponent = ComponentEngine.createComponent('password_input');
      
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'before',
          targetId: components[1].id,
          componentType: 'password_input'
        },
        () => newComponent
      );

      expect(result).toHaveLength(4);
      expect(result[1].type).toBe('password_input');
      expect(result[2].id).toBe(components[1].id); // Original email_input moved
    });

    it('should handle drop after position', () => {
      const newComponent = ComponentEngine.createComponent('password_input');
      
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'after',
          targetId: components[1].id,
          componentType: 'password_input'
        },
        () => newComponent
      );

      expect(result).toHaveLength(4);
      expect(result[2].type).toBe('password_input');
      expect(result[1].id).toBe(components[1].id); // Original email_input stays
    });

    it('should handle center drop on empty canvas', () => {
      const newComponent = ComponentEngine.createComponent('text_input');
      
      const result = dragDropLogic.handleDrop(
        [],
        {
          type: 'center',
          targetId: '',
          componentType: 'text_input'
        },
        () => newComponent
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('text_input');
    });

    it('should handle inside drop for layout components', () => {
      const layoutComponent = ComponentEngine.createComponent('vertical_layout');
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
  });

  describe('Horizontal Layout Creation', () => {

    it('should create horizontal layout with left positioning', () => {
      const newComponent = ComponentEngine.createComponent('password_input');
      
      const result = dragDropLogic.handleDrop(
        [components[0]], // Single component
        {
          type: 'left',
          targetId: components[0].id,
          componentType: 'password_input'
        },
        () => newComponent
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('horizontal_layout');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children![0].type).toBe('password_input'); // New component on left
      expect(result[0].children![1].id).toBe(components[0].id); // Original component on right
    });

    it('should create horizontal layout with right positioning', () => {
      const newComponent = ComponentEngine.createComponent('password_input');
      
      const result = dragDropLogic.handleDrop(
        [components[0]], // Single component
        {
          type: 'right',
          targetId: components[0].id,
          componentType: 'password_input'
        },
        () => newComponent
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('horizontal_layout');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children![0].id).toBe(components[0].id); // Original component on left
      expect(result[0].children![1].type).toBe('password_input'); // New component on right
    });

    it('should expand existing horizontal layout', () => {
      // Create horizontal layout first
      const existingLayout = ComponentEngine.createComponent('horizontal_layout');
      existingLayout.children = [components[0], components[1]];
      
      const newComponent = ComponentEngine.createComponent('password_input');
      
      const result = dragDropLogic.handleDrop(
        [existingLayout],
        {
          type: 'right',
          targetId: components[1].id,
          componentType: 'password_input'
        },
        () => newComponent
      );

      expect(result[0].children).toHaveLength(3);
      expect(result[0].children![2].type).toBe('password_input');
    });

    it('should handle maximum capacity in horizontal layouts', () => {
      // Create layout with 4 components (maximum)
      const fullLayout = ComponentEngine.createComponent('horizontal_layout');
      fullLayout.children = [
        ComponentEngine.createComponent('text_input'),
        ComponentEngine.createComponent('email_input'),
        ComponentEngine.createComponent('password_input'),
        ComponentEngine.createComponent('number_input')
      ];

      const newComponent = ComponentEngine.createComponent('textarea');
      
      const result = dragDropLogic.handleDrop(
        [fullLayout],
        {
          type: 'right',
          targetId: fullLayout.children[3].id,
          componentType: 'textarea'
        },
        () => newComponent
      );

      // Should not add to full layout, might create new standalone or show error
      expect(result[0].children).toHaveLength(4); // Should remain at max capacity
    });
  });

  describe('Component Repositioning', () => {

    it('should move existing component before target', () => {
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'before',
          targetId: components[0].id,
          componentType: 'select',
          dragType: 'existing-item',
          sourceId: components[2].id // Move select to beginning
        },
        () => ComponentEngine.createComponent('select')
      );

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(components[2].id); // Select component moved to front
      expect(result[1].id).toBe(components[0].id); // Text input
      expect(result[2].id).toBe(components[1].id); // Email input
    });

    it('should move existing component after target', () => {
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'after',
          targetId: components[1].id,
          componentType: 'text_input',
          dragType: 'existing-item',
          sourceId: components[0].id // Move text_input after email_input
        },
        () => ComponentEngine.createComponent('text_input')
      );

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(components[1].id); // Email input first
      expect(result[1].id).toBe(components[0].id); // Text input moved after
      expect(result[2].id).toBe(components[2].id); // Select input last
    });

    it('should handle repositioning within horizontal layouts', () => {
      const layout = ComponentEngine.createComponent('horizontal_layout');
      layout.children = [components[0], components[1], components[2]];

      const result = dragDropLogic.handleDrop(
        [layout],
        {
          type: 'left',
          targetId: components[0].id,
          componentType: 'select',
          dragType: 'existing-item',
          sourceId: components[2].id // Move select to leftmost position
        },
        () => ComponentEngine.createComponent('select')
      );

      expect(result[0].children).toHaveLength(3);
      expect(result[0].children![0].id).toBe(components[2].id); // Select moved to left
      expect(result[0].children![1].id).toBe(components[0].id); // Text input
      expect(result[0].children![2].id).toBe(components[1].id); // Email input
    });
  });

  describe('Layout Transformation Logic', () => {

    it('should extract component from horizontal layout', () => {
      const layout = ComponentEngine.createComponent('horizontal_layout');
      layout.children = [components[0], components[1], components[2]];

      // Extract middle component to create standalone
      const result = dragDropLogic.handleDrop(
        [layout],
        {
          type: 'after',
          targetId: layout.id, // Drop after the layout
          componentType: 'email_input',
          dragType: 'existing-item',
          sourceId: components[1].id
        },
        () => ComponentEngine.createComponent('email_input')
      );

      // Should have layout with 2 components + extracted component
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('horizontal_layout');
      expect(result[0].children).toHaveLength(2); // Reduced from 3 to 2
      expect(result[1].id).toBe(components[1].id); // Extracted component
    });

    it('should dissolve horizontal layout when reduced to single component', () => {
      const layout = ComponentEngine.createComponent('horizontal_layout');
      layout.children = [components[0], components[1]]; // Only 2 components

      // Extract one component, leaving only one in layout
      const result = dragDropLogic.handleDrop(
        [layout],
        {
          type: 'before',
          targetId: layout.id,
          componentType: 'email_input',
          dragType: 'existing-item',
          sourceId: components[1].id
        },
        () => ComponentEngine.createComponent('email_input')
      );

      // Layout should dissolve, leaving 2 standalone components
      expect(result).toHaveLength(2);
      expect(result.every(comp => comp.type !== 'horizontal_layout')).toBe(true);
    });

    it('should handle cross-layout movement', () => {
      const layout1 = ComponentEngine.createComponent('horizontal_layout');
      layout1.children = [components[0], components[1]];
      
      const layout2 = ComponentEngine.createComponent('horizontal_layout');
      layout2.children = [components[2]];

      // Move component from layout1 to layout2
      const result = dragDropLogic.handleDrop(
        [layout1, layout2],
        {
          type: 'right',
          targetId: components[2].id,
          componentType: 'text_input',
          dragType: 'existing-item',
          sourceId: components[0].id
        },
        () => ComponentEngine.createComponent('text_input')
      );

      // Layout1 should have 1 component, layout2 should have 2
      expect(result[0].children).toHaveLength(1);
      expect(result[1].children).toHaveLength(2);
      expect(result[1].children![1].id).toBe(components[0].id);
    });
  });

  describe('Nested Layout Handling', () => {

    it('should handle drops in nested layouts', () => {
      const outerLayout = ComponentEngine.createComponent('vertical_layout');
      const innerLayout = ComponentEngine.createComponent('horizontal_layout');
      
      innerLayout.children = [components[0], components[1]];
      outerLayout.children = [innerLayout, components[2]];

      const newComponent = ComponentEngine.createComponent('textarea');

      const result = dragDropLogic.handleDrop(
        [outerLayout],
        {
          type: 'right',
          targetId: components[1].id, // Add to inner horizontal layout
          componentType: 'textarea'
        },
        () => newComponent
      );

      expect(result[0].children).toHaveLength(2); // Outer layout unchanged
      expect(result[0].children![0].children).toHaveLength(3); // Inner layout expanded
      expect(result[0].children![0].children![2].type).toBe('textarea');
    });

    it('should handle deep nesting searches', () => {
      const level1 = ComponentEngine.createComponent('vertical_layout');
      const level2 = ComponentEngine.createComponent('horizontal_layout');
      const level3 = ComponentEngine.createComponent('vertical_layout');
      
      level3.children = [components[0]];
      level2.children = [level3, components[1]];
      level1.children = [level2, components[2]];

      const newComponent = ComponentEngine.createComponent('number_input');

      const result = dragDropLogic.handleDrop(
        [level1],
        {
          type: 'after',
          targetId: components[0].id, // Target deeply nested component
          componentType: 'number_input'
        },
        () => newComponent
      );

      // Should find and insert into deeply nested structure
      const deepestLevel = result[0].children![0].children![0];
      expect(deepestLevel.children).toHaveLength(2);
      expect(deepestLevel.children![1].type).toBe('number_input');
    });
  });

  describe('Error Handling and Edge Cases', () => {

    it('should handle unknown drop position types', () => {
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

      expect(result).toEqual(components); // Should return unchanged
      expect(consoleSpy).toHaveBeenCalledWith('❌ Unknown drop position:', 'unknown');
      
      consoleSpy.mockRestore();
    });

    it('should handle drops on non-existent targets', () => {
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'before',
          targetId: 'nonexistent',
          componentType: 'text_input'
        },
        () => ComponentEngine.createComponent('text_input')
      );

      expect(result).toEqual(components); // Should return unchanged
    });

    it('should handle repositioning non-existent source components', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = dragDropLogic.handleDrop(
        components,
        {
          type: 'before',
          targetId: components[0].id,
          componentType: 'text_input',
          dragType: 'existing-item',
          sourceId: 'nonexistent'
        },
        () => ComponentEngine.createComponent('text_input')
      );

      expect(result).toEqual(components); // Should return unchanged
      expect(consoleSpy).toHaveBeenCalledWith('❌ Source component not found:', 'nonexistent');
      
      consoleSpy.mockRestore();
    });

    it('should handle circular references in layout finding', () => {
      const layout1 = ComponentEngine.createComponent('horizontal_layout');
      const layout2 = ComponentEngine.createComponent('vertical_layout');
      
      // Create circular reference
      layout1.children = [layout2];
      layout2.children = [layout1];

      // Should not cause infinite loop
      const result = dragDropLogic.handleDrop(
        [layout1],
        {
          type: 'inside',
          targetId: layout1.id,
          componentType: 'text_input'
        },
        () => ComponentEngine.createComponent('text_input')
      );

      // Should detect and handle circular reference gracefully
      expect(result).toBeDefined();
    });

    it('should handle empty component arrays', () => {
      const newComponent = ComponentEngine.createComponent('text_input');
      
      const result = dragDropLogic.handleDrop(
        [],
        {
          type: 'center',
          targetId: '',
          componentType: 'text_input'
        },
        () => newComponent
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('text_input');
    });

    it('should handle malformed component data', () => {
      const malformedComponents = [
        { id: 'test', type: 'text_input' } as any, // Missing required fields
        null as any,
        undefined as any
      ].filter(Boolean);

      const result = dragDropLogic.handleDrop(
        malformedComponents,
        {
          type: 'after',
          targetId: 'test',
          componentType: 'email_input'
        },
        () => ComponentEngine.createComponent('email_input')
      );

      expect(result).toBeDefined();
    });
  });

  describe('Configuration Options', () => {

    it('should respect disabled horizontal layouts configuration', () => {
      const restrictedLogic = new DragDropLogic({
        enableHorizontalLayouts: false,
        enableVerticalReordering: true,
        enableCrossLayoutMovement: true,
        autoDissolveEmptyLayouts: true
      });

      const newComponent = ComponentEngine.createComponent('password_input');
      
      const result = restrictedLogic.handleDrop(
        [components[0]],
        {
          type: 'left',
          targetId: components[0].id,
          componentType: 'password_input'
        },
        () => newComponent
      );

      // Should not create horizontal layout
      expect(result.some(comp => comp.type === 'horizontal_layout')).toBe(false);
    });

    it('should respect disabled vertical reordering configuration', () => {
      const restrictedLogic = new DragDropLogic({
        enableHorizontalLayouts: true,
        enableVerticalReordering: false,
        enableCrossLayoutMovement: true,
        autoDissolveEmptyLayouts: true
      });

      const result = restrictedLogic.handleDrop(
        components,
        {
          type: 'before',
          targetId: components[1].id,
          componentType: 'text_input',
          dragType: 'existing-item',
          sourceId: components[0].id
        },
        () => ComponentEngine.createComponent('text_input')
      );

      // Should return original order if vertical reordering disabled
      expect(result[0].id).toBe(components[0].id);
    });

    it('should respect disabled auto-dissolution configuration', () => {
      const persistentLogic = new DragDropLogic({
        enableHorizontalLayouts: true,
        enableVerticalReordering: true,
        enableCrossLayoutMovement: true,
        autoDissolveEmptyLayouts: false
      });

      const layout = ComponentEngine.createComponent('horizontal_layout');
      layout.children = [components[0], components[1]];

      // Extract one component
      const result = persistentLogic.handleDrop(
        [layout],
        {
          type: 'after',
          targetId: layout.id,
          componentType: 'email_input',
          dragType: 'existing-item',
          sourceId: components[1].id
        },
        () => ComponentEngine.createComponent('email_input')
      );

      // Layout should persist even with single child
      expect(result[0].type).toBe('horizontal_layout');
      expect(result[0].children).toHaveLength(1);
    });
  });

  describe('Performance and Optimization', () => {

    it('should handle large component arrays efficiently', () => {
      const largeComponentArray = Array.from({ length: 1000 }, (_, i) => 
        ComponentEngine.createComponent('text_input')
      );

      const startTime = performance.now();
      
      const result = dragDropLogic.handleDrop(
        largeComponentArray,
        {
          type: 'before',
          targetId: largeComponentArray[500].id,
          componentType: 'email_input'
        },
        () => ComponentEngine.createComponent('email_input')
      );

      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(result).toHaveLength(1001);
    });

    it('should handle deeply nested layouts efficiently', () => {
      // Create deeply nested structure
      let currentLayout = ComponentEngine.createComponent('vertical_layout');
      const rootLayout = currentLayout;
      
      for (let i = 0; i < 50; i++) {
        const newLayout = ComponentEngine.createComponent('horizontal_layout');
        newLayout.children = [ComponentEngine.createComponent('text_input')];
        currentLayout.children = [newLayout];
        currentLayout = newLayout;
      }

      const startTime = performance.now();
      
      const result = dragDropLogic.handleDrop(
        [rootLayout],
        {
          type: 'after',
          targetId: currentLayout.children![0].id,
          componentType: 'email_input'
        },
        () => ComponentEngine.createComponent('email_input')
      );

      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // Should handle deep nesting efficiently
      expect(result).toBeDefined();
    });
  });
});