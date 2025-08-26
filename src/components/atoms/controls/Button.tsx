
import React from 'react';
import UnifiedButton from './UnifiedButton';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}) => {
  return (
    <UnifiedButton
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      type={type}
    >
      {children}
    </UnifiedButton>
  );
};

export default Button;
