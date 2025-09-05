import { describe, it, expect } from 'vitest';
import { ComponentEngine } from '../core/ComponentEngine';
import { FormStateEngine } from '../core/FormStateEngine';

describe('Debug Components', () => {
  it('should create a component', () => {
    const component = ComponentEngine.createComponent('text_input');
    console.log('Created component:', JSON.stringify(component, null, 2));
    expect(component).toBeDefined();
    expect(component.type).toBe('text_input');
    expect(component.id).toBeDefined();
    expect(component.label).toBe('Text Input');
  });

  it('should add component to state', () => {
    const initialState = {
      pages: [{ 
        id: 'page1', 
        title: 'Page 1', 
        components: [],
        layout: {} 
      }],
      currentPageId: 'page1',
      selectedComponentId: null
    };

    console.log('Initial state:', JSON.stringify(initialState, null, 2));

    const action = {
      type: 'ADD_COMPONENT',
      payload: { componentType: 'text_input', pageId: 'page1' }
    };

    const newState = FormStateEngine.executeAction(initialState, action);
    console.log('New state after ADD_COMPONENT:', JSON.stringify(newState, null, 2));

    const components = FormStateEngine.getCurrentPageComponents(newState.pages, 'page1');
    console.log('Components found:', components.length);
    
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe('text_input');
  });
});