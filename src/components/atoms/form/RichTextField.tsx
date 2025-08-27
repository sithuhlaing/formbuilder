import React from 'react';
import RichTextEditor from '../forms/RichTextEditor';

interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ htmlFor, required, children }) => (
  <label 
    htmlFor={htmlFor}
    style={{
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '4px'
    }}
  >
    {children}
    {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
  </label>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div style={{
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px'
  }}>
    {message}
  </div>
);

const HelpText: React.FC<{ text: string }> = ({ text }) => (
  <div style={{
    color: '#6b7280',
    fontSize: '12px',
    marginTop: '4px'
  }}>
    {text}
  </div>
);

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