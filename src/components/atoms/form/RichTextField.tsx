import React from 'react';
import RichTextEditor from './RichTextEditor';
import Label from '../forms/Label';
import ErrorMessage from '../forms/ErrorMessage';
import HelpText from '../forms/HelpText';

interface RichTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helpText?: string;
  height?: string;
  className?: string;
}

const RichTextField: React.FC<RichTextFieldProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  required = false,
  error,
  helpText,
  height = '200px',
  className = '',
}) => {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <Label htmlFor={`richtext-${label}`} required={required}>
          {label}
        </Label>
      )}
      
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        height={height}
        className={error ? 'error' : ''}
      />
      
      {error && <ErrorMessage message={error} />}
      {helpText && !error && <HelpText text={helpText} />}
    </div>
  );
};

export default RichTextField;