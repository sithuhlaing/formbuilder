import { describe, it, expect } from 'vitest';
import { createSimpleComponent } from './componentUtils';

describe('ComponentEngine - Data Factory', () => {
  
  it('generates deterministic JSON schemas with collision-free UUIDs', () => {
    const componentA = createSimpleComponent('email_input');
    const componentB = createSimpleComponent('email_input');

    expect(componentA.id).toBeDefined();
    expect(componentB.id).toBeDefined();
    expect(componentA.id).not.toBe(componentB.id);
    
    expect(componentA.type).toBe('email_input');
    expect(componentA.required).toBe(false);
  });

  it('hydrates selection components with mandatory default array structures', () => {
    const dropdown = createSimpleComponent('select');
    
    expect(Array.isArray(dropdown.options)).toBe(true);
    expect(dropdown.options?.length).toBeGreaterThan(0);
    expect(dropdown.options?.[0]).toHaveProperty('label');
    expect(dropdown.options?.[0]).toHaveProperty('value');
  });
});
