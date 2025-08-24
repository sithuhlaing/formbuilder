
import React from 'react';

interface PreviewRadioGroupProps {
  options?: string[];
  className?: string;
}

const PreviewRadioGroup: React.FC<PreviewRadioGroupProps> = ({
  options = [],
  className = ''
}) => {
  return (
    <div className={`radio-group-preview ${className}`}>
      {options.length > 0 ? (
        options.map((option, index) => (
          <div key={index} className="radio-item" style={{ marginBottom: 'var(--space-2)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input type="radio" name="preview-radio" disabled style={{ opacity: 0.5 }} />
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

export default PreviewRadioGroup;
