
import React from 'react';

interface SimpleActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  variant?: 'default' | 'danger' | 'primary';
  disabled?: boolean;
}

const VARIANT_STYLES = {
  default: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
  danger: 'text-red-600 hover:text-red-800 hover:bg-red-50',
  primary: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
} as const;

const SimpleActionButton: React.FC<SimpleActionButtonProps> = ({
  onClick,
  icon,
  title,
  variant = 'default',
  disabled = false
}) => {
  const variantClass = VARIANT_STYLES[variant];
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const handleClick = () => {
    if (!disabled) {
      onClick();
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

export default SimpleActionButton;
