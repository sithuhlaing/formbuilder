import React from 'react';

interface PreviewCheckboxGroupProps {
  options?: string[];
  className?: string;
}

const PreviewCheckboxGroup: React.FC<PreviewCheckboxGroupProps> = ({
  options = [],
  className = ''
}) => {
  return (
    <div className={`checkbox-group-preview ${className}`}>
      {options.length > 0 ? (
        options.map((option, index) => (
          <div key={index} className="checkbox-item" style={{ marginBottom: 'var(--space-2)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input type="checkbox" disabled style={{ opacity: 0.5 }} />
              <span style={{ color: 'var(--color-gray-600)' }}>{option}</span>
            </label>
          </div>
        ))
      ) : (
        <div style={{ color: 'var(--color-gray-500)', fontStyle: 'italic' }}>
          No options configured
        </div>
      )}
    </div>
  );
};

export default PreviewCheckboxGroup;