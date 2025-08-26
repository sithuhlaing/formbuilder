
import React from 'react';
import UnifiedButton from './UnifiedButton';

interface SimpleActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  variant?: 'default' | 'danger' | 'primary';
  disabled?: boolean;
}

const SimpleActionButton: React.FC<SimpleActionButtonProps> = ({
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
      variant={variant}
      icon={icon}
      iconOnly={true}
      size="sm"
    />
  );
};

export default SimpleActionButton;
