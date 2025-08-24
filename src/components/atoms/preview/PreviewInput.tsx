
import React from 'react';

interface PreviewInputProps {
  type?: 'text' | 'number' | 'email' | 'date';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const PreviewInput: React.FC<PreviewInputProps> = ({
  type = 'text',
  placeholder,
  className = '',
  disabled = true
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`input ${className}`}
      style={{
        width: '100%',
        padding: 'var(--space-2)',
        border: '1px solid var(--color-gray-300)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-gray-50)',
        color: 'var(--color-gray-500)'
      }}
    />
  );
};

export default PreviewInput;
