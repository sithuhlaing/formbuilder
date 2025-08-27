import type { ComponentType } from '../components/types';

export const getDefaultLabel = (componentType: ComponentType): string => {
  switch (componentType) {
    case 'text_input':
      return 'Text Input';
    case 'number_input':
      return 'Number Input';
    case 'textarea':
      return 'Text Area';
    case 'rich_text':
      return 'Rich Text Editor';
    case 'select':
      return 'Select Dropdown';
    case 'multi_select':
      return 'Multi-Select';
    case 'checkbox':
      return 'Checkbox';
    case 'radio_group':
      return 'Radio Group';
    case 'date_picker':
      return 'Date Picker';
    case 'file_upload':
      return 'File Upload';
    case 'section_divider':
      return 'Section Divider';
    case 'signature':
      return 'Digital Signature';
    case 'horizontal_layout':
      return 'Horizontal Layout';
    case 'vertical_layout':
      return 'Vertical Layout';
    default:
      return 'Form Component';
  }
};

export const getDefaultPlaceholder = (componentType: ComponentType): string => {
  switch (componentType) {
    case 'text_input':
      return 'Enter text...';
    case 'number_input':
      return 'Enter a number...';
    case 'textarea':
      return 'Enter your message...';
    case 'select':
      return 'Choose an option...';
    case 'multi_select':
      return 'Choose options...';
    case 'date_picker':
      return 'Select date...';
    case 'file_upload':
      return 'Click to upload files...';
    default:
      return 'Enter value...';
  }
};