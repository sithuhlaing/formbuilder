import React from 'react';
import type { ComponentType } from '../../types/component';

interface ComponentIconProps {
  type: ComponentType;
}

const ComponentIcon: React.FC<ComponentIconProps> = ({ type }) => {
  const getIcon = (componentType: ComponentType): string => {
    switch (componentType) {
      case 'text_input':
        return '📝';
      case 'email_input':
        return '📧';
      case 'password_input':
        return '🔒';
      case 'number_input':
        return '🔢';
      case 'textarea':
        return '📄';
      case 'rich_text':
        return '📋';
      case 'select':
        return '📋';
      case 'multi_select':
        return '☑️';
      case 'checkbox':
        return '✅';
      case 'radio_group':
        return '🔘';
      case 'date_picker':
        return '📅';
      case 'file_upload':
        return '📁';
      case 'section_divider':
        return '➖';
      case 'signature':
        return '✍️';
      case 'button':
        return '🔲';
      case 'heading':
        return '📰';
      case 'card':
        return '🃏';
      case 'horizontal_layout':
        return '↔️';
      case 'vertical_layout':
        return '↕️';
      default:
        return '❓';
    }
  };

  return <span>{getIcon(type)}</span>;
};

export default ComponentIcon;
