
import React from 'react';

interface PreviewContainerPlaceholderProps {
  message: string;
  className?: string;
}

const PreviewContainerPlaceholder: React.FC<PreviewContainerPlaceholderProps> = ({
  message,
  className = ''
}) => {
  return (
    <div className={`container-placeholder ${className}`} style={{
      padding: 'var(--space-8)',
      textAlign: 'center',
      color: 'var(--color-gray-500)',
      fontSize: 'var(--text-sm)',
      fontStyle: 'italic',
      border: '2px dashed var(--color-gray-300)',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--color-gray-50)'
    }}>
      {message}
    </div>
  );
};

export default PreviewContainerPlaceholder;
