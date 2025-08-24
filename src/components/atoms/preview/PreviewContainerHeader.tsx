
import React from 'react';

interface PreviewContainerHeaderProps {
  icon: string;
  label?: string;
  info: string;
  className?: string;
}

const PreviewContainerHeader: React.FC<PreviewContainerHeaderProps> = ({
  icon,
  label,
  info,
  className = ''
}) => {
  return (
    <div className={`container-header ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-2)',
      backgroundColor: 'var(--color-gray-100)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 'var(--space-2)'
    }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <div>
        {label && (
          <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
            {label}
          </div>
        )}
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)' }}>
          {info}
        </div>
      </div>
    </div>
  );
};

export default PreviewContainerHeader;
