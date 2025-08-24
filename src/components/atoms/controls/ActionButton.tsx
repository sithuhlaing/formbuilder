import React from 'react';
import type { ActionButtonProps } from '../../types/props';

const VARIANT_STYLES = {
  default: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  danger: 'bg-red-100 hover:bg-red-200 text-red-700',
  primary: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
  warning: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700',
  delete: 'bg-red-100 hover:bg-red-200 text-red-700'
} as const;

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  title,
  variant = 'default',
  disabled = false
}) => {
  const variantClass = VARIANT_STYLES[variant];
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors duration-200 ${variantClass} ${disabledClass}`}
    >
      {icon}
    </button>
  );
};

export default ActionButton;