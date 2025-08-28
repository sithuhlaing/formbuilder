import type { ComponentCategory, ComponentDefinition } from '../types';

export const componentDefinitions: ComponentDefinition[] = [
  // Input Components
  {
    type: 'text_input',
    name: 'Text Input',
    icon: '📝',
    description: 'Single-line text input field',
    category: 'inputs'
  },
  {
    type: 'email_input',
    name: 'Email Input',
    icon: '📧',
    description: 'Email address input with validation',
    category: 'inputs'
  },
  {
    type: 'password_input',
    name: 'Password Input',
    icon: '🔒',
    description: 'Password input field',
    category: 'inputs'
  },
  {
    type: 'number_input',
    name: 'Number Input',
    icon: '#️⃣',
    description: 'Numeric input field with validation',
    category: 'inputs'
  },
  {
    type: 'textarea',
    name: 'Text Area',
    icon: '📄',
    description: 'Multi-line text input field',
    category: 'inputs'
  },
  {
    type: 'rich_text',
    name: 'Rich Text Editor',
    icon: '✏️',
    description: 'WYSIWYG text editor with formatting',
    category: 'inputs'
  },
  {
    type: 'date_picker',
    name: 'Date Picker',
    icon: '📅',
    description: 'Date selection component',
    category: 'inputs'
  },
  {
    type: 'file_upload',
    name: 'File Upload',
    icon: '📎',
    description: 'File upload and attachment field',
    category: 'inputs'
  },
  {
    type: 'signature',
    name: 'Digital Signature',
    icon: '✍️',
    description: 'Digital signature capture field',
    category: 'inputs'
  },

  // Selection Components
  {
    type: 'select',
    name: 'Dropdown',
    icon: '📋',
    description: 'Single-choice dropdown selection',
    category: 'selections'
  },
  {
    type: 'multi_select',
    name: 'Multi Select',
    icon: '☑️',
    description: 'Multiple-choice dropdown selection',
    category: 'selections'
  },
  {
    type: 'radio_group',
    name: 'Radio Group',
    icon: '🔘',
    description: 'Single-choice radio button group',
    category: 'selections'
  },
  {
    type: 'checkbox',
    name: 'Checkbox',
    icon: '✅',
    description: 'Single checkbox for yes/no choices',
    category: 'selections'
  },

  // Layout Components
  {
    type: 'horizontal_layout',
    name: 'Row Layout',
    icon: '↔️',
    description: 'Horizontal container for side-by-side components',
    category: 'layout'
  },
  {
    type: 'vertical_layout',
    name: 'Column Layout',
    icon: '↕️',
    description: 'Vertical container for stacked components',
    category: 'layout'
  },
  {
    type: 'section_divider',
    name: 'Section Divider',
    icon: '➖',
    description: 'Visual separator between form sections',
    category: 'layout'
  }
];

export const componentCategories: ComponentCategory[] = [
  {
    id: 'inputs',
    name: 'Input Fields',
    icon: '📝',
    description: 'Text, number, and data input components',
    components: componentDefinitions.filter(comp => comp.category === 'inputs')
  },
  {
    id: 'selections',
    name: 'Selection Controls',
    icon: '☑️',
    description: 'Dropdown, radio, and checkbox components',
    components: componentDefinitions.filter(comp => comp.category === 'selections')
  },
  {
    id: 'layout',
    name: 'Layout & Structure',
    icon: '📐',
    description: 'Containers and organizational components',
    components: componentDefinitions.filter(comp => comp.category === 'layout')
  }
];