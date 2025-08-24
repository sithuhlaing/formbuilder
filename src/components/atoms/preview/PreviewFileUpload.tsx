import React from 'react';

interface PreviewFileUploadProps {
  className?: string;
}

const PreviewFileUpload: React.FC<PreviewFileUploadProps> = ({
  className = ''
}) => {
  return (
    <div className={`file-upload-preview ${className}`}>
      <div className="file-upload-area" style={{
        border: '2px dashed var(--color-gray-300)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        textAlign: 'center',
        backgroundColor: 'var(--color-gray-50)',
        color: 'var(--color-gray-500)'
      }}>
        <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>📎</div>
        <div>Click to upload or drag and drop</div>
        <div style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
          Supported formats: PDF, DOC, JPG, PNG
        </div>
      </div>
    </div>
  );
};

export default PreviewFileUpload;