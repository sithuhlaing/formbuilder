import React from 'react';

interface UnifiedButtonProps {
  children?: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'default' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  stopPropagation?: boolean;
}

const UnifiedButton: React.FC<UnifiedButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  title,
  icon,
  iconOnly = false,
  stopPropagation = false
}) => {
  const getVariantStyles = () => {
    const baseStyles = {
      padding: size === 'sm' ? 'var(--space-1) var(--space-2)' : 
               size === 'lg' ? 'var(--space-3) var(--space-4)' : 'var(--space-2) var(--space-3)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid transparent',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? '0.5' : '1',
      transition: 'all var(--transition-fast)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-1)',
      fontSize: size === 'sm' ? 'var(--text-xs)' : 
                size === 'lg' ? 'var(--text-base)' : 'var(--text-sm)',
      fontWeight: 'var(--font-weight-medium)',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: 'var(--color-blue-600)',
          color: 'white',
          border: '1px solid var(--color-blue-600)',
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: 'var(--color-gray-100)',
          color: 'var(--color-gray-700)',
          border: '1px solid var(--color-gray-300)',
        };
      case 'danger':
        return {
          ...baseStyles,
          backgroundColor: 'var(--color-red-100)',
          color: 'var(--color-red-700)',
          border: '1px solid var(--color-red-200)',
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: 'var(--color-orange-100)',
          color: 'var(--color-orange-700)',
          border: '1px solid var(--color-orange-200)',
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: 'var(--color-gray-100)',
          color: 'var(--color-gray-700)',
          border: '1px solid var(--color-gray-200)',
        };
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const content = iconOnly ? icon : (
    <>
      {icon}
      {children}
    </>
  );

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      title={title}
      className={className}
      style={getVariantStyles()}
    >
      {content}
    </button>
  );
};

export default UnifiedButton;
