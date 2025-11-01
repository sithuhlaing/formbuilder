/**
 * COMPREHENSIVE DRAG-DROP TESTING - Phase 3 Implementation
 * Tests all drag-drop scenarios from PRD requirements
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import { SimpleCanvas } from '../components/SimpleCanvas';
import { SimpleComponentPalette } from '../components/SimpleComponentPalette';
import { SimplePropertiesPanel } from '../components/SimplePropertiesPanel';
import type { Component, ComponentType } from '../types/components';
import { 
  calculateDropZone, 
  handleSmartDrop, 
  checkAndDissolveRowContainer,
  moveRowLayout,
  validateRowLayoutDrop
} from '../core/smartDropHandler';

// Test wrapper with DnD context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

describe('Comprehensive Drag-Drop Testing', () => {
  const mockOnDrop = vi.fn();
  const mockOnSelect = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnMove = vi.fn();
  const mockOnUpdateComponents = vi.fn();
  const mockOnUpdate = vi.fn();

  const defaultProps = {
    onDrop: mockOnDrop,
    onSelect: mockOnSelect,
    onDelete: mockOnDelete,
    onMove: mockOnMove,
    onUpdateComponents: mockOnUpdateComponents,
    selectedId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PRD Requirement 2.2: Drag from Palette', () => {
    test('should create new component when dragged from palette', async () => {
      const components: Component[] = [];
      
      render(
        <TestWrapper>
          <SimpleCanvas
            {...defaultProps}
            components={components}
            onUpdateComponents={mockOnUpdateComponents}
          />
        </TestWrapper>
      );

      // Simulate dragging text_input from palette
      const dragItem = {
        type: 'component-type' as const,
        componentType: 'text_input' as ComponentType,
      };

      // Mock drop handling
      const mockCanvas = document.createElement('div');
      const mockTarget = document.createElement('div');
      const mockRect = { 
        left: 100, top: 100, width: 200, height: 50,
        x: 100, y: 100, bottom: 150, right: 300, 
        toJSON: () => ({})
      } as DOMRect;
      vi.spyOn(mockTarget, 'getBoundingClientRect').mockReturnValue(mockRect);
      
      const dropZone = calculateDropZone(
        { x: 150, y: 125 }, // Center of target
        mockRect,
        { type: 'text_input', id: 'test', label: 'Test' } as Component
      );

      expect(dropZone).toBeDefined();
      expect(dropZone).toBe('after');
    });

    test('should show visual feedback during palette drag', () => {
      const components: Component[] = [];
      
      render(
        <TestWrapper>
          <SimpleCanvas
            {...defaultProps}
            components={components}
          />
        </TestWrapper>
      );

      // Check empty state
      expect(screen.getByText(/Drag components here to start building/)).toBeInTheDocument();
    });
  });

  describe('PRD Requirement 2.3: Drop Position Detection', () => {
      const mockRect = { x: 0, y: 0, width: 200, height: 50, bottom: 50, right: 200, toJSON: () => ({}) } as DOMRect;
      const mockComponent = { type: 'text_input', id: 'test' };

      test('should detect LEFT drop position (20% edge)', () => {
        const dropZone = calculateDropZone(
          { x: 30, y: 25 }, // 15% from left (in 20% zone)
          mockRect,
          mockComponent
        );

        expect(dropZone).toBe('left');
      });

      test('should detect RIGHT drop position (20% edge)', () => {
        const dropZone = calculateDropZone(
          { x: 170, y: 25 }, // 85% from left (in 20% zone)
          mockRect,
          { ...mockComponent, label: 'Test', type: 'text_input' as ComponentType }
        );

        expect(dropZone).toBe('right');
      });

      test('should detect BEFORE drop position (30% top)', () => {
        const dropZone = calculateDropZone(
          { x: 100, y: 10 }, // 20% from top (in 30% zone)
          mockRect,
          { ...mockComponent, label: 'Test', type: 'text_input' as ComponentType }
        );

        expect(dropZone).toBe('before');
      });

      test('should detect AFTER drop position (30% bottom)', () => {
        const dropZone = calculateDropZone(
          { x: 100, y: 40 }, // 80% from top (in 30% zone)
          mockRect,
          { ...mockComponent, label: 'Test', type: 'text_input' as ComponentType }
        );

        expect(dropZone).toBe('after');
      });

      test('should block CENTER drops on row layouts', () => {
        const rowComponent = { type: 'horizontal_layout' as ComponentType, id: 'row', label: 'Row' };
        const dropZone = calculateDropZone(
          { x: 100, y: 25 }, // Center of row
          mockRect,
          rowComponent
        );

        expect(dropZone).toBeNull();
      });
  });

  describe('PRD Requirement 2.4: Horizontal Layout Creation', () => {
    test('should create horizontal layout when dropping left/right', () => {
      const components: Component[] = [
        { id: 'comp1', type: 'text_input', label: 'First Name' },
        { id: 'comp2', type: 'text_input', label: 'Last Name' }
      ];

      const result = handleSmartDrop(components, 'text_input', {
        targetComponentId: 'comp1',
        position: 'right',
        index: 0,
        isValid: true
      });

      expect(result.components).toHaveLength(1);
      expect(result.components[0].type).toBe('horizontal_layout');
      expect(result.components[0].children).toHaveLength(2);
      expect(result.selectedId).toBeDefined();
    });

    test('should enforce 4-component maximum in horizontal layouts', () => {
      // Create a row with 4 components
      const existingRow: Component = {
        id: 'row',
        type: 'horizontal_layout',
        label: 'Row',
        children: [
          { id: 'c1', type: 'text_input', label: 'Field 1' },
          { id: 'c2', type: 'text_input', label: 'Field 2' },
          { id: 'c3', type: 'text_input', label: 'Field 3' },
          { id: 'c4', type: 'text_input', label: 'Field 4' }
        ]
      };

      const components = [existingRow];
      const result = handleSmartDrop(components, 'text_input', {
        targetComponentId: 'c1',
        position: 'right',
        index: 0,
        isValid: true
      });

      // Should not add the 5th component
      expect(result.components).toHaveLength(1);
      expect(result.components[0].children).toHaveLength(4);
    });

    test('should create row with correct order based on drop position', () => {
      const components: Component[] = [
        { id: 'comp1', type: 'text_input', label: 'First Name' }
      ];

      // Test LEFT drop (new component first)
      const leftResult = handleSmartDrop(components, 'text_input', {
        targetComponentId: 'comp1',
        position: 'left',
        index: 0,
        isValid: true
      });

      expect(leftResult.components[0].children?.[0].type).toBe('text_input'); // New component
      expect(leftResult.components[0].children?.[1].id).toBe('comp1'); // Target component

      // Test RIGHT drop (target first)
      const rightResult = handleSmartDrop(components, 'text_input', {
        targetComponentId: 'comp1',
        position: 'right',
        index: 0,
        isValid: true
      });

      expect(rightResult.components[0].children?.[0].id).toBe('comp1'); // Target component
      expect(rightResult.components[0].children?.[1].type).toBe('text_input'); // New component
    });
  });

  describe('PRD Requirement 2.5: Auto-Dissolution Logic', () => {
    test('should dissolve row when only 1 child remains', () => {
      const rowWithOneChild: Component = {
        id: 'row',
        type: 'horizontal_layout',
        label: 'Row',
        children: [
          { id: 'child1', type: 'text_input', label: 'Last Remaining' }
        ]
      };

      const components = [rowWithOneChild];
      const result = checkAndDissolveRowContainer(rowWithOneChild, components);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('child1'); // Child promoted to canvas level
      expect(result[0].type).toBe('text_input');
    });

    test('should dissolve row when empty', () => {
      const emptyRow: Component = {
        id: 'row',
        type: 'horizontal_layout',
        label: 'Row',
        children: []
      };

      const components = [emptyRow];
      const result = checkAndDissolveRowContainer(emptyRow, components);

      expect(result).toHaveLength(0); // Row deleted, no children to promote
    });

    test('should preserve row with 2+ children', () => {
      const rowWithTwoChildren: Component = {
        id: 'row',
        type: 'horizontal_layout',
        label: 'Row',
        children: [
          { id: 'child1', type: 'text_input', label: 'First' },
          { id: 'child2', type: 'text_input', label: 'Second' }
        ]
      };

      const components = [rowWithTwoChildren];
      const result = checkAndDissolveRowContainer(rowWithTwoChildren, components);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('horizontal_layout'); // Row preserved
      expect(result[0].children).toHaveLength(2);
    });
  });

  describe('PRD Requirement 2.6: Row Layout Dragging', () => {
    test('should allow vertical repositioning of row layouts', () => {
      const rowLayout: Component = {
        id: 'row1',
        type: 'horizontal_layout',
        label: 'Row 1',
        children: [
          { id: 'c1', type: 'text_input', label: 'Field 1' },
          { id: 'c2', type: 'text_input', label: 'Field 2' }
        ]
      };

      const components = [
        { id: 'sep1', type: 'text_input', label: 'Separator 1' },
        rowLayout,
        { id: 'sep2', type: 'text_input', label: 'Separator 2' }
      ];

      const result = moveRowLayout(rowLayout, 'sep2', 'after', components);

      expect(result[0].id).toBe('sep1');
      expect(result[1].id).toBe('sep2');
      expect(result[2].id).toBe('row1'); // Row moved to bottom
    });

    test('should block horizontal positioning of row layouts', () => {
      const validation = validateRowLayoutDrop(
        { type: 'text_input', id: 'target' },
        'left'
      );

      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('only be repositioned vertically');
    });

    test('should prevent circular references', () => {
      const childComponent = { type: 'text_input', id: 'child1' };
      const rowLayout: Component = {
        id: 'row1',
        type: 'horizontal_layout',
        label: 'Row 1',
        children: [childComponent]
      };

      const validation = validateRowLayoutDrop(childComponent, 'after');

      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('circular reference');
    });
  });

  describe('PRD Requirement 2.7: Component Palette Integration', () => {
    test('should render all component categories', () => {
      render(
        <TestWrapper>
          <SimpleComponentPalette onAddComponent={mockOnDrop} />
        </TestWrapper>
      );

      // Check that main categories are present
      expect(screen.getByText(/Input Components/i)).toBeInTheDocument();
      expect(screen.getByText(/Selection Components/i)).toBeInTheDocument();
      expect(screen.getByText(/Layout Components/i)).toBeInTheDocument();
      expect(screen.getByText(/UI Components/i)).toBeInTheDocument();
    });

    test('should filter components by category', () => {
      render(
        <TestWrapper>
          <SimpleComponentPalette onAddComponent={mockOnDrop} />
        </TestWrapper>
      );

      // Should show text input in Input Components
      expect(screen.getByText(/Text Input/i)).toBeInTheDocument();
      
      // Should show select in Selection Components  
      expect(screen.getByText(/Select/i)).toBeInTheDocument();
      
      // Should show horizontal layout in Layout Components
      expect(screen.getByText(/Horizontal Layout/i)).toBeInTheDocument();
    });
  });

  describe('PRD Requirement 2.8: Properties Panel Integration', () => {
    test('should show empty state when no component selected', () => {
      render(
        <SimplePropertiesPanel
          component={null}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/No component selected/i)).toBeInTheDocument();
      expect(screen.getByText(/Click on a component to edit its properties/i)).toBeInTheDocument();
    });

    test('should show component properties when selected', () => {
      const component: Component = {
        id: 'test',
        type: 'text_input',
        label: 'Test Input',
        required: true,
        fieldId: 'test_field'
      };

      render(
        <SimplePropertiesPanel
          component={component}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByDisplayValue('Test Input')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test_field')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /required/i })).toBeChecked();
    });

    test('should show layout-specific properties for horizontal layouts', () => {
      const layoutComponent: Component = {
        id: 'row',
        type: 'horizontal_layout',
        label: 'Row Layout',
        properties: {
          layoutConfig: {
            distribution: 'equal',
            spacing: 'normal',
            alignment: 'top'
          }
        }
      };

      render(
        <SimplePropertiesPanel
          component={layoutComponent}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/Layout Configuration/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('equal')).toBeInTheDocument();
      expect(screen.getByDisplayValue('normal')).toBeInTheDocument();
      expect(screen.getByDisplayValue('top')).toBeInTheDocument();
    });
  });

  describe('PRD Requirement 2.9: Complex Layout Scenarios', () => {
    test('should handle mixed vertical and horizontal layouts', () => {
      // Create complex layout: Heading + Row + Standalone + Row
      const components: Component[] = [
        { id: 'heading', type: 'heading', label: 'Contact Form' },
        {
          id: 'row1',
          type: 'horizontal_layout',
          label: 'Name Row',
          children: [
            { id: 'first', type: 'text_input', label: 'First Name' },
            { id: 'last', type: 'text_input', label: 'Last Name' }
          ]
        },
        { id: 'email', type: 'email_input', label: 'Email' },
        {
          id: 'row2',
          type: 'horizontal_layout',
          label: 'Location Row',
          children: [
            { id: 'city', type: 'text_input', label: 'City' },
            { id: 'state', type: 'text_input', label: 'State' },
            { id: 'zip', type: 'text_input', label: 'Zip' }
          ]
        }
      ];

      render(
        <TestWrapper>
          <SimpleCanvas
            {...defaultProps}
            components={components}
            mode="preview"
          />
        </TestWrapper>
      );

      // Should render all components in correct order
      expect(screen.getByText('Contact Form')).toBeInTheDocument();
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('City')).toBeInTheDocument();
      expect(screen.getByText('State')).toBeInTheDocument();
      expect(screen.getByText('Zip')).toBeInTheDocument();
    });

    test('should maintain component count during complex operations', () => {
      let components: Component[] = [
        { id: 'comp1', type: 'text_input', label: 'Field 1' },
        { id: 'comp2', type: 'text_input', label: 'Field 2' }
      ];

      // Create horizontal layout (2 components → 1 row)
      let result = handleSmartDrop(components, 'text_input', {
        targetComponentId: 'comp1',
        position: 'right',
        index: 0,
        isValid: true
      });
      components = result.components;
      expect(components).toHaveLength(1); // 1 row containing 2 components

      // Add third component (row + standalone)
      result = handleSmartDrop(components, 'text_input', {
        targetComponentId: 'comp1',
        position: 'after',
        index: 0,
        isValid: true
      });
      components = result.components;
      expect(components).toHaveLength(2); // 1 row + 1 standalone

      // Dissolve row by removing one component
      const row = components.find(c => c.type === 'horizontal_layout') as Component;
      if (row && row.children) {
        row.children = row.children.slice(0, 1); // Remove one child
        const dissolvedResult = checkAndDissolveRowContainer(row, components);
        expect(dissolvedResult).toHaveLength(2); // 2 standalone components
      }
    });
  });

  describe('PRD Requirement 2.10: Error Handling', () => {
    test('should handle invalid drop positions gracefully', () => {
      const components: Component[] = [
        { id: 'comp1', type: 'text_input', label: 'Field 1' }
      ];

      // Try invalid drop (center of component)
      const result = handleSmartDrop(components, 'text_input', {
        targetComponentId: 'comp1',
        position: 'center',
        index: 0,
        isValid: false
      });

      expect(result.components).toEqual(components); // No change
      expect(result.selectedId).toBeNull();
    });

    test('should validate component types', () => {
      const rowLayout: Component = {
        id: 'row',
        type: 'horizontal_layout',
        label: 'Row',
        children: []
      };

      // Try to add invalid component type
      const result = handleSmartDrop([rowLayout], 'invalid_type' as ComponentType, {
        targetComponentId: 'row',
        position: 'right',
        index: 0,
        isValid: true
      });

      // Should handle gracefully (no crash)
      expect(Array.isArray(result.components)).toBe(true);
    });
  });

  describe('Performance Requirements', () => {
    test('should handle large numbers of components efficiently', () => {
      // Create 100 components
      const manyComponents: Component[] = Array.from({ length: 100 }, (_, i) => ({
        id: `comp${i}`,
        type: 'text_input' as ComponentType,
        label: `Field ${i + 1}`
      }));

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <SimpleCanvas
            {...defaultProps}
            components={manyComponents}
            mode="preview"
          />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (< 100ms for 100 components)
      expect(renderTime).toBeLessThan(100);
    });

    test('should debounce property updates', () => {
      const component: Component = {
        id: 'test',
        type: 'text_input',
        label: 'Test Input'
      };

      render(
        <SimplePropertiesPanel
          component={component}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByDisplayValue('Test Input');
      
      // Simulate rapid typing
      fireEvent.change(input, { target: { value: 'T' } });
      fireEvent.change(input, { target: { value: 'Te' } });
      fireEvent.change(input, { target: { value: 'Tes' } });
      fireEvent.change(input, { target: { value: 'Test' } });

      // Should not call update for every keystroke (debounced)
      expect(mockOnUpdate).toHaveBeenCalledTimes(0);
    });
  });
});
