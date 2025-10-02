/**
 * Smart Drop Handler - Implements 2.3 and 2.4
 * - Auto-creates horizontal layout when dropping side-by-side
 * - Supports dropping into nested layouts
 */

import { v4 as uuidv4 } from 'uuid';
import type { Component, ComponentType } from '../types/components';
import { createComponent } from './componentUtils';

export interface DropZoneInfo {
  targetComponentId?: string;
  position: 'before' | 'after' | 'left' | 'right' | 'inside';
  index: number;
  parentId?: string;
}

/**
 * Determines drop zone based on mouse position relative to target component
 */
export function calculateDropZone(
  clientOffset: { x: number; y: number },
  elementRect: DOMRect,
  isLayoutComponent: boolean
): 'before' | 'after' | 'left' | 'right' | 'inside' {
  const relativeX = clientOffset.x - elementRect.left;
  const relativeY = clientOffset.y - elementRect.top;

  const width = elementRect.width;
  const height = elementRect.height;

  // Calculate percentages
  const xPercent = relativeX / width;
  const yPercent = relativeY / height;

  // For layout components, allow inside drops
  if (isLayoutComponent && xPercent > 0.2 && xPercent < 0.8 && yPercent > 0.2 && yPercent < 0.8) {
    return 'inside';
  }

  // Define edge zones (20% from each edge)
  const EDGE_THRESHOLD = 0.2;

  // Left edge - create horizontal layout
  if (xPercent < EDGE_THRESHOLD) {
    return 'left';
  }

  // Right edge - create horizontal layout
  if (xPercent > (1 - EDGE_THRESHOLD)) {
    return 'right';
  }

  // Top half - insert before
  if (yPercent < 0.5) {
    return 'before';
  }

  // Bottom half - insert after
  return 'after';
}

/**
 * Creates a horizontal layout wrapping two components
 */
export function createHorizontalLayout(
  component1: Component,
  component2: Component
): Component {
  return {
    id: `layout-${uuidv4()}`,
    type: 'horizontal_layout',
    label: 'Horizontal Layout',
    children: [component1, component2]
  };
}

/**
 * Handles smart drop logic
 * Returns: { components: Component[], selectedId: string }
 */
export function handleSmartDrop(
  components: Component[],
  componentType: ComponentType,
  dropZone: DropZoneInfo
): { components: Component[]; selectedId: string } {
  const newComponent = createComponent(componentType);

  // Simple case: drop at specific index (no target component)
  if (!dropZone.targetComponentId) {
    const newComponents = [...components];
    newComponents.splice(dropZone.index, 0, newComponent);
    return { components: newComponents, selectedId: newComponent.id };
  }

  // Find target component
  const targetIndex = components.findIndex(c => c.id === dropZone.targetComponentId);
  if (targetIndex === -1) {
    // Target not found, append to end
    return { components: [...components, newComponent], selectedId: newComponent.id };
  }

  const targetComponent = components[targetIndex];
  const newComponents = [...components];

  // Handle different drop positions
  switch (dropZone.position) {
    case 'before':
      // Insert before target
      newComponents.splice(targetIndex, 0, newComponent);
      break;

    case 'after':
      // Insert after target
      newComponents.splice(targetIndex + 1, 0, newComponent);
      break;

    case 'left':
    case 'right':
      // Create horizontal layout
      const existingComponent = newComponents[targetIndex];
      const horizontalLayout = dropZone.position === 'left'
        ? createHorizontalLayout(newComponent, existingComponent)
        : createHorizontalLayout(existingComponent, newComponent);

      // Replace existing component with layout
      newComponents[targetIndex] = horizontalLayout;
      break;

    case 'inside':
      // Drop inside layout component
      if (targetComponent.type === 'horizontal_layout' || targetComponent.type === 'vertical_layout') {
        const updatedTarget = {
          ...targetComponent,
          children: [...(targetComponent.children || []), newComponent]
        };
        newComponents[targetIndex] = updatedTarget;
      } else {
        // Not a layout, insert after
        newComponents.splice(targetIndex + 1, 0, newComponent);
      }
      break;
  }

  return { components: newComponents, selectedId: newComponent.id };
}

/**
 * Insert component into nested layout
 */
export function insertIntoNestedLayout(
  components: Component[],
  componentType: ComponentType,
  parentLayoutId: string,
  position?: number
): { components: Component[]; selectedId: string } {
  const newComponent = createComponent(componentType);

  const insertIntoChildren = (comps: Component[]): Component[] => {
    return comps.map(comp => {
      if (comp.id === parentLayoutId) {
        const children = comp.children || [];
        const insertIndex = position !== undefined ? position : children.length;
        const newChildren = [...children];
        newChildren.splice(insertIndex, 0, newComponent);

        return {
          ...comp,
          children: newChildren
        };
      }

      // Recursively search in children
      if (comp.children) {
        return {
          ...comp,
          children: insertIntoChildren(comp.children)
        };
      }

      return comp;
    });
  };

  return {
    components: insertIntoChildren(components),
    selectedId: newComponent.id
  };
}
