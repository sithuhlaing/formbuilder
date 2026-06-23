import { v4 as uuidv4 } from 'uuid';
import type { Component, ComponentType } from '../types/components';
import { DEFAULT_COMPONENT_LABELS, DEFAULT_PLACEHOLDERS } from '../types/components';

/**
 * Creates a component object with default properties based on the component type.
 */
export function createComponent(type: ComponentType): Component {
  const id = `comp-${uuidv4()}`;
  const label = DEFAULT_COMPONENT_LABELS[type] || 'New Component';
  
  const component: Component = {
    id,
    type,
    label,
    required: false,
    validation: {
      required: false
    }
  };

  // Add default placeholders for input fields
  const placeholder = DEFAULT_PLACEHOLDERS[type];
  if (placeholder) {
    component.placeholder = placeholder;
  }

  // Add options array for selection components
  if (type === 'select' || type === 'radio_group') {
    component.options = [
      { label: 'Option 1', value: 'option_1' },
      { label: 'Option 2', value: 'option_2' },
      { label: 'Option 3', value: 'option_3' }
    ];
  }

  // Add empty children array for layouts
  if (type === 'horizontal_layout' || type === 'vertical_layout') {
    component.children = [];
  }

  return component;
}

/**
 * Recursively updates a component in a list (tree) of components.
 */
export function updateComponent(components: Component[], id: string, updates: Partial<Component>): Component[] {
  return components.map(comp => {
    if (comp.id === id) {
      return { ...comp, ...updates };
    }
    if (comp.children && comp.children.length > 0) {
      return {
        ...comp,
        children: updateComponent(comp.children, id, updates)
      };
    }
    return comp;
  });
}

/**
 * Recursively deletes a component from a list (tree) of components.
 */
export function deleteComponent(components: Component[], id: string): Component[] {
  return components
    .filter(comp => comp.id !== id)
    .map(comp => {
      if (comp.children && comp.children.length > 0) {
        return {
          ...comp,
          children: deleteComponent(comp.children, id)
        };
      }
      return comp;
    });
}

/**
 * Recursively finds a component in a list (tree) of components.
 */
export function findComponent(components: Component[], id: string): Component | null {
  for (const comp of components) {
    if (comp.id === id) {
      return comp;
    }
    if (comp.children && comp.children.length > 0) {
      const found = findComponent(comp.children, id);
      if (found) return found;
    }
  }
  return null;
}

export const createSimpleComponent = createComponent;

