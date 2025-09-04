// Debug script to test horizontal layout creation
const { JSDOM } = require('jsdom');
const { render, screen, fireEvent } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event').default;

// Simple test to check if horizontal layouts are being created
console.log('Testing horizontal layout creation...');

// Check if the FormStateEngine is properly creating horizontal layouts
const FormStateEngine = require('./src/core/FormStateEngine').FormStateEngine;
const ComponentEngine = require('./src/core/ComponentEngine').ComponentEngine;

// Test horizontal layout creation directly
const initialState = {
  pages: [{
    id: 'page1',
    title: 'Test Page',
    components: [
      ComponentEngine.createComponent('text_input')
    ]
  }],
  currentPageId: 'page1',
  selectedComponentId: null
};

console.log('Initial state:', JSON.stringify(initialState, null, 2));

// Test INSERT_HORIZONTAL_LAYOUT action
const action = {
  type: 'INSERT_HORIZONTAL_LAYOUT',
  payload: {
    componentType: 'email_input',
    targetId: initialState.pages[0].components[0].id,
    side: 'right'
  }
};

console.log('Action:', JSON.stringify(action, null, 2));

try {
  const newState = FormStateEngine.executeAction(initialState, action);
  console.log('New state after horizontal layout creation:');
  console.log(JSON.stringify(newState, null, 2));
  
  // Check if horizontal layout was created
  const horizontalLayouts = newState.pages[0].components.filter(c => c.type === 'horizontal_layout');
  console.log(`Found ${horizontalLayouts.length} horizontal layouts`);
  
  if (horizontalLayouts.length > 0) {
    console.log('Horizontal layout details:', JSON.stringify(horizontalLayouts[0], null, 2));
  }
} catch (error) {
  console.error('Error creating horizontal layout:', error);
}
