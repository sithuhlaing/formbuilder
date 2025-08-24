
import React from 'react';

interface PreviewSectionDividerProps {
  label: string;
  description?: string;
  className?: string;
}

const PreviewSectionDivider: React.FC<PreviewSectionDividerProps> = ({
  label,
  description,
  className = ''
}) => {
  return (
    <div className={`section-divider-preview ${className}`}>
      <div className="section-divider" style={{
        borderTop: '2px solid var(--color-gray-300)',
        paddingTop: 'var(--space-4)',
        marginBottom: 'var(--space-4)'
      }}>
        <h3 style={{
          margin: '0 0 var(--space-2) 0',
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-gray-800)'
        }}>
          {label}
        </h3>
        {description && (
          <p style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            color: 'var(--color-gray-600)'
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PreviewSectionDivider;
