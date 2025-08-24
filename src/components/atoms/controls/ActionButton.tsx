import React from 'react';
import type { ActionButtonProps } from '../../types/props';

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  title,
  variant = 'default',
  disabled = false
}) => {
  const getVariantStyle = () => {
    const base = {
      padding: 'var(--space-2)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid transparent',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? '0.5' : '1',
      transition: 'all var(--transition-fast)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'var(--text-sm)'
    };

    switch (variant) {
      case 'danger':
      case 'delete':
        return { 
          ...base, 
          backgroundColor: 'var(--color-red-100)', 
          color: 'var(--color-red-700)',
          border: '1px solid var(--color-red-200)'
        };
      case 'primary':
        return { 
          ...base, 
          backgroundColor: 'var(--color-blue-100)', 
          color: 'var(--color-blue-700)',
          border: '1px solid var(--color-blue-200)'
        };
      case 'warning':
        return { 
          ...base, 
          backgroundColor: 'var(--color-orange-100)', 
          color: 'var(--color-orange-700)',
          border: '1px solid var(--color-orange-200)'
        };
      default:
        return { 
          ...base, 
          backgroundColor: 'var(--color-gray-100)', 
          color: 'var(--color-gray-700)',
          border: '1px solid var(--color-gray-200)'
        };
    }
  };

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
      style={getVariantStyle()}
    >
      {icon}
    </button>
  );
};

export default ActionButton;