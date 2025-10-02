const text_input = 'text_input';
const email_input = 'email_input';
const password_input = 'password_input';
const number_input = 'number_input';
const textarea = 'textarea';
const rich_text = 'rich_text';
const select = 'select';
const multi_select = 'multi_select';
const checkbox = 'checkbox';        
const radio_group   = 'radio_group';
const date_picker = 'date_picker';
const file_upload = 'file_upload';
const signature = 'signature';
const horizontal_layout = 'horizontal_layout';
const vertical_layout = 'vertical_layout';
const section_divider = 'section_divider';
const button = 'button';
const heading = 'heading';
const card = 'card';

export const componentTypes = {
  text_input,
  email_input,
  password_input,
  number_input,
  textarea,
  rich_text,
  select,
  multi_select,
  checkbox,
  radio_group,
  date_picker,
  file_upload,
  signature,
  horizontal_layout,
  vertical_layout,
  section_divider,
  button,
  heading,
  card,
};

export const InputComponentTypes = [
  text_input,
  email_input,
  password_input,
  number_input,
  textarea,
  rich_text
]; 

export const LayoutComponentTypes = [
    horizontal_layout,
    vertical_layout,
];

export const UIComponentTypes = [
    section_divider,
    button,
    heading,
    card,
]; 

export const SpecialComponentTypes = [
    date_picker,
    file_upload,
    signature,
];

export const SelectionComponentTypes = [
    select,
    multi_select,
    checkbox,
    radio_group,
];

export type ComponentType = keyof typeof componentTypes;

// Type mappings between component types and schema types
export const TYPE_MAPPINGS: Record<string, string> = {
  text_input: "text",
  email_input: "email",
  password_input: "password",
  number_input: "number",
  textarea: "textarea",
  rich_text: "rich_text",
  select: "select",
  multi_select: "multi_select",
  checkbox: "checkbox",
  radio_group: "radio_group",
  date_picker: "date_picker",
  file_upload: "file_upload",
  signature: "signature",
  horizontal_layout: "horizontal_layout",
  vertical_layout: "vertical_layout",
  section_divider: "section_divider",
  button: "button",
  heading: "heading",
  card: "card",
};

// Reverse mapping from schema types to component types
export const REVERSE_TYPE_MAPPINGS: Record<string, string> = {
  text: "text_input",
  email: "email_input",
  password: "password_input",
  number: "number_input",
  textarea: "textarea",
  rich_text: "rich_text",
  select: "select",
  multi_select: "multi_select",
  checkbox: "checkbox",
  radio_group: "radio_group",
  date_picker: "date_picker",
  file_upload: "file_upload",
  signature: "signature",
  horizontal_layout: "horizontal_layout",
  vertical_layout: "vertical_layout",
  section_divider: "section_divider",
  button: "button",
  heading: "heading",
  card: "card",
};

// Helper function to generate unique IDs
export const generateId = (): number => {
  return Math.floor(Math.random() * 10000000);
};

// Helper function to get schema type from component type
export const getSchemaType = (componentType: string): string => {
  return TYPE_MAPPINGS[componentType] || componentType;
};

// Helper function to get component type from schema type
export const getComponentType = (schemaType: string): string => {
  return REVERSE_TYPE_MAPPINGS[schemaType] || schemaType;
};