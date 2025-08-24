
import React from 'react';

interface PreviewTextareaProps {
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

const PreviewTextarea: React.FC<PreviewTextareaProps> = ({
  placeholder,
  rows = 3,
  className = '',
  disabled = true
}) => {
  return (
    <textarea
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`textarea ${className}`}
      style={{
        width: '100%',
        padding: 'var(--space-2)',
        border: '1px solid var(--color-gray-300)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-gray-50)',
        color: 'var(--color-gray-500)',
        resize: 'vertical'
      }}
    />
  );
};

export default PreviewTextarea;
