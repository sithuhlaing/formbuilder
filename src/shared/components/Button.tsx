/**
 * Clean Button Component - Shared
 * Single purpose: Reusable button with variants
 */

import React from 'react';
import { classNames } from '../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={classNames(
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};