/**
 * Reusable Input Components
 * Provides consistent input elements for forms
 */

import React from 'react';
import { classNames } from '../utils';

interface BaseInputProps {
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'url' | 'tel';
}

interface NumberInputProps extends BaseInputProps {
  min?: number;
  max?: number;
  step?: number;
}

interface TextareaProps extends BaseInputProps {
  rows?: number;
  resize?: boolean;
}

interface SelectProps extends BaseInputProps {
  options: string[];
  multiple?: boolean;
}

// Text Input Component
export const TextInput: React.FC<TextInputProps> = ({
  type = 'text',
  className,
  placeholder,
  required,
  disabled,
  readOnly,
  value,
  onChange
}) => {
  return (
    <input
      type={type}
      className={classNames('form-field__input', className)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
};

// Number Input Component
export const NumberInput: React.FC<NumberInputProps> = ({
  className,
  placeholder,
  required,
  disabled,
  readOnly,
  value,
  onChange,
  min,
  max,
  step
}) => {
  return (
    <input
      type="number"
      className={classNames('form-field__input', className)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      min={min}
      max={max}
      step={step}
    />
  );
};

// Textarea Component
export const Textarea: React.FC<TextareaProps> = ({
  className,
  placeholder,
  required,
  disabled,
  readOnly,
  value,
  onChange,
  rows = 4,
  resize = true
}) => {
  return (
    <textarea
      className={classNames('form-field__textarea', className)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      rows={rows}
      style={{ resize: resize ? 'vertical' : 'none' }}
    />
  );
};

// Select Component
export const Select: React.FC<SelectProps> = ({
  className,
  required,
  disabled,
  value,
  onChange,
  options,
  multiple = false
}) => {
  return (
    <select
      className={classNames('form-field__select', className)}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      multiple={multiple}
    >
      <option value="">Choose an option</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

// Checkbox Component
export const Checkbox: React.FC<BaseInputProps & { id: string }> = ({
  id,
  className,
  required,
  disabled,
  value,
  onChange
}) => {
  return (
    <input
      type="checkbox"
      id={id}
      className={classNames('form-field__checkbox', className)}
      required={required}
      disabled={disabled}
      checked={value === 'true' || value === '1'}
      onChange={(e) => onChange?.(e.target.checked ? 'true' : 'false')}
    />
  );
};

// Radio Group Component
export const RadioGroup: React.FC<BaseInputProps & { 
  name: string; 
  options: string[];
}> = ({
  name,
  options,
  className,
  required,
  disabled,
  value,
  onChange
}) => {
  return (
    <div className={classNames('form-field__radio-group', className)}>
      {options.map((option, index) => (
        <div key={index} className="form-field__radio-item">
          <input
            type="radio"
            id={`${name}_${index}`}
            name={name}
            value={option}
            className="form-field__radio"
            required={required}
            disabled={disabled}
            checked={value === option}
            onChange={(e) => onChange?.(e.target.value)}
          />
          <label htmlFor={`${name}_${index}`} className="form-field__radio-label">
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

// File Upload Component
export const FileUpload: React.FC<BaseInputProps & { 
  accept?: string;
  multiple?: boolean;
}> = ({
  className,
  required,
  disabled,
  accept,
  multiple = false,
  onChange
}) => {
  return (
    <input
      type="file"
      className={classNames('form-field__file', className)}
      required={required}
      disabled={disabled}
      accept={accept}
      multiple={multiple}
      onChange={(e) => {
        const files = Array.from(e.target.files || []);
        onChange?.(files.map(f => f.name).join(', '));
      }}
    />
  );
};