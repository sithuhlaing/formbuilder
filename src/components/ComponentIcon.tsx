
import React from 'react';
import {
  FaRegKeyboard,
  FaRegEnvelope,
  FaRegListAlt,
  FaRegCalendarAlt,
  FaRegCheckSquare,
  FaRegDotCircle,
  FaHashtag,
  FaParagraph,
  FaGripHorizontal,
  FaQuestionCircle,
  FaRegFileAlt,
  FaSignature,
  FaCheck,
  FaMinus,
  FaArrowsAltV,
  FaEdit,
  FaLock,
} from 'react-icons/fa';
import type { ComponentType } from '../types';

interface ComponentIconProps {
  type: ComponentType;
  className?: string;
}

const iconMap: Record<ComponentType | 'unknown', React.ElementType> = {
  text_input: FaRegKeyboard,
  email: FaRegEnvelope,
  password: FaLock,
  number_input: FaHashtag,
  textarea: FaParagraph,
  select: FaRegListAlt,
  date_picker: FaRegCalendarAlt,
  checkbox: FaRegCheckSquare,
  radio_group: FaRegDotCircle,
  horizontal_layout: FaGripHorizontal,
  file_upload: FaRegFileAlt,
  signature: FaSignature,
  rich_text: FaEdit,
  multi_select: FaCheck,
  section_divider: FaMinus,
  vertical_layout: FaArrowsAltV,
  unknown: FaQuestionCircle,
};

const ComponentIcon: React.FC<ComponentIconProps> = ({ type, className }) => {
  const Icon = iconMap[type] || iconMap.unknown;
  return <Icon className={className} />;
};

export default ComponentIcon;
