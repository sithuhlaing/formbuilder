
import React from 'react';
import type { ComponentIconProps } from '../../types/props';

const COMPONENT_ICONS = {
  text_input: '📝',
  number_input: '🔢',
  textarea: '📄',
  select: '📋',
  multi_select: '☑️',
  checkbox: '✅',
  radio_group: '🔘',
  date_picker: '📅',
  file_upload: '📎',
  section_divider: '➖',
  signature: '✍️',
  horizontal_layout: '↔️',
  vertical_layout: '↕️',
} as const;

const ComponentIcon: React.FC<ComponentIconProps> = ({ type, className = '' }) => {
  const icon = COMPONENT_ICONS[type] || '❓';
  
  return (
    <span className={`inline-block ${className}`}>
      {icon}
    </span>
  );
};

export default ComponentIcon;
