import { describe, it, expect } from 'vitest';
import { createSimpleComponent, updateComponent, deleteComponent, findComponent } from '../core/componentUtils';

describe('ComponentEngine - Data Factory', () => {
  
  it('generates deterministic JSON schemas with collision-free UUIDs', () => {
    const componentA = createSimpleComponent('email_input');
    const componentB = createSimpleComponent('email_input');

    expect(componentA.id).toBeDefined();
    expect(componentB.id).toBeDefined();
    expect(componentA.id).not.toBe(componentB.id);
    
    expect(componentA.type).toBe('email_input');
    expect(componentA.required).toBe(false);

    // Cover the default label fallback branch
    const fallbackComponent = createSimpleComponent('invalid-type' as any);
    expect(fallbackComponent.label).toBe('New Component');
  });

  it('hydrates selection components with mandatory default array structures', () => {
    const dropdown = createSimpleComponent('select');
    
    expect(Array.isArray(dropdown.options)).toBe(true);
    expect(dropdown.options?.length).toBeGreaterThan(0);
    expect(dropdown.options?.[0]).toHaveProperty('label');
    expect(dropdown.options?.[0]).toHaveProperty('value');
  });

  it('creates layout components with empty children arrays', () => {
    const layout = createSimpleComponent('horizontal_layout');
    expect(layout.children).toEqual([]);
  });

  it('updates components recursively in a tree', () => {
    const root = createSimpleComponent('vertical_layout');
    const child = createSimpleComponent('text_input');
    root.children = [child];

    const updated = updateComponent([root], child.id, { label: 'Updated Label' });
    expect(updated[0].children?.[0].label).toBe('Updated Label');

    const noChange = updateComponent([root], 'non-existent', { label: 'No Change' });
    expect(noChange[0].children?.[0].label).toBe('Text Input');
  });

  it('deletes components recursively from a tree', () => {
    const root = createSimpleComponent('vertical_layout');
    const child1 = createSimpleComponent('text_input');
    const child2 = createSimpleComponent('email_input');
    root.children = [child1, child2];

    const remaining = deleteComponent([root], child1.id);
    expect(remaining[0].children?.length).toBe(1);
    expect(remaining[0].children?.[0].id).toBe(child2.id);

    const noneDeleted = deleteComponent([root], 'non-existent');
    expect(noneDeleted[0].children?.length).toBe(2);
  });

  it('finds components recursively in a tree', () => {
    const root = createSimpleComponent('vertical_layout');
    const child = createSimpleComponent('text_input');
    root.children = [child];

    const found = findComponent([root], child.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(child.id);

    const notFound = findComponent([root], 'non-existent');
    expect(notFound).toBeNull();
  });
});
