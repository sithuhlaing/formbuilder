import React from 'react';

interface PreviewMultiSelectProps {
  options?: string[];
  className?: string;
}

const PreviewMultiSelect: React.FC<PreviewMultiSelectProps> = ({
  options = [],
  className = ''
}) => {
  return (
    <div className={`multi-select-preview ${className}`}>
      <div className="multi-select-container">
        <div className="multi-select-input" style={{
          border: '1px solid var(--color-gray-300)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-2)',
          minHeight: '40px',
          backgroundColor: 'var(--color-gray-50)',
          color: 'var(--color-gray-500)',
          display: 'flex',
          alignItems: 'center'
        }}>
          Select multiple options...
        </div>
        {options.length > 0 && (
          <div className="multi-select-options" style={{
            marginTop: 'var(--space-1)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-gray-500)'
          }}>
            Available: {options.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewMultiSelect;