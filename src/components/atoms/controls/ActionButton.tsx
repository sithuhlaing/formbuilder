import React from 'react';
import UnifiedButton from './UnifiedButton';
import type { ActionButtonProps } from '../../types/props';

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  title,
  variant = 'default',
  disabled = false
}) => {
  return (
    <UnifiedButton
      onClick={onClick}
      title={title}
      disabled={disabled}
      variant={variant === 'delete' ? 'danger' : variant}
      icon={icon}
      iconOnly={true}
      size="sm"
    />
  );
};

export default ActionButton;