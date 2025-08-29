/**
 * Action Button Component - Small icon buttons for actions
 */

import React from 'react';

interface ActionButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  icon: string;
  title: string;
  className?: string;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  title,
  className = '',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`action-button ${className} ${disabled ? 'action-button--disabled' : ''}`}
    >
      {icon}
    </button>
  );
};