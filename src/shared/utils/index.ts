
export { generateId } from './generateId';
export { classNames } from './classNames';
// debounce and deepClone removed - were unused

// Type exports for utilities
export type ComponentTypesMap = typeof COMPONENT_TYPES;

// Constants
export const COMPONENT_TYPES = {
  TEXT_INPUT: 'text_input',
  EMAIL_INPUT: 'email_input',
  PASSWORD_INPUT: 'password_input',
  NUMBER_INPUT: 'number_input',
  TEXTAREA: 'textarea',
  RICH_TEXT: 'rich_text',
  SELECT: 'select',
  MULTI_SELECT: 'multi_select',
  CHECKBOX: 'checkbox',
  RADIO_GROUP: 'radio_group',
  DATE_PICKER: 'date_picker',
  FILE_UPLOAD: 'file_upload',
  SECTION_DIVIDER: 'section_divider',
  SIGNATURE: 'signature',
  BUTTON: 'button',
  HEADING: 'heading',
  CARD: 'card',
  HORIZONTAL_LAYOUT: 'horizontal_layout',
  VERTICAL_LAYOUT: 'vertical_layout',
} as const;
