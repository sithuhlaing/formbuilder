
import React from 'react';

interface PreviewSelectProps {
  options?: string[];
  className?: string;
  disabled?: boolean;
}

const PreviewSelect: React.FC<PreviewSelectProps> = ({
  options = [],
  className = '',
  disabled = true
}) => {
  return (
    <select
      disabled={disabled}
      className={`select ${className}`}
      style={{
        width: '100%',
        padding: 'var(--space-2)',
        border: '1px solid var(--color-gray-300)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-gray-50)',
        color: 'var(--color-gray-500)'
      }}
    >
      <option value="">Select an option...</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default PreviewSelect;
