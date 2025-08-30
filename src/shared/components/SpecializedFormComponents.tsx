/**
 * Specialized Form Components
 * Complex form components that don't fit the basic input pattern
 */

import React from 'react';
import { classNames } from '../utils';

interface SectionDividerProps {
  label?: string;
  className?: string;
}

interface SignatureProps {
  className?: string;
  placeholder?: string;
}

interface ButtonPreviewProps {
  buttonType?: 'primary' | 'secondary' | 'success' | 'danger';
  buttonText?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  text?: string;
  label?: string;
  className?: string;
}

interface CardPreviewProps {
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

// Section Divider Component
export const SectionDivider: React.FC<SectionDividerProps> = ({
  label,
  className
}) => {
  return (
    <div className={classNames('form-field', className)}>
      <hr className="form-field__divider" />
      {label && <h3 className="form-field__section-title">{label}</h3>}
    </div>
  );
};

// Signature Component
export const SignatureField: React.FC<SignatureProps> = ({
  className,
  placeholder = "✍️ Signature area"
}) => {
  return (
    <div className={classNames('signature-field', className)}>
      <div className="signature-placeholder">
        {placeholder}
      </div>
    </div>
  );
};

// Button Preview Component
export const ButtonPreview: React.FC<ButtonPreviewProps> = ({
  buttonType = 'primary',
  buttonText,
  label,
  disabled = true,
  className
}) => {
  return (
    <button
      type="button"
      className={classNames(`btn btn--${buttonType}`, className)}
      disabled={disabled}
    >
      {buttonText || label || 'Button'}
    </button>
  );
};

// Heading Component
export const HeadingPreview: React.FC<HeadingProps> = ({
  level = 1,
  text,
  label,
  className
}) => {
  const headingTag = `h${level}` as React.ElementType;
  
  return React.createElement(
    headingTag,
    { 
      className: classNames('form-field__heading', className) 
    },
    text || label || `Heading ${level}`
  );
};

// Card Preview Component
export const CardPreview: React.FC<CardPreviewProps> = ({
  label,
  children,
  className
}) => {
  return (
    <div className={classNames('card-preview', className)}>
      <div className="card-header">
        <span className="card-label">{label || 'Card'}</span>
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

// Date Picker Component (simplified for preview)
export const DatePicker: React.FC<{
  className?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}> = ({
  className,
  required,
  disabled,
  readOnly,
  value,
  onChange
}) => {
  return (
    <input
      type="date"
      className={classNames('form-field__input', className)}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
};

// Unknown Component Fallback
export const UnknownComponent: React.FC<{ 
  type: string;
  className?: string;
}> = ({ 
  type, 
  className 
}) => {
  return (
    <div className={classNames('form-field__unknown', className)}>
      <span className="form-field__error">
        Unknown component type: {type}
      </span>
    </div>
  );
};