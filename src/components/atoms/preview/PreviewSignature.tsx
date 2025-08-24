
import React from 'react';

interface PreviewSignatureProps {
  className?: string;
}

const PreviewSignature: React.FC<PreviewSignatureProps> = ({
  className = ''
}) => {
  return (
    <div className={`signature-preview ${className}`}>
      <div className="signature-pad" style={{
        border: '2px dashed var(--color-gray-300)',
        borderRadius: 'var(--radius-md)',
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-gray-50)',
        color: 'var(--color-gray-500)',
        fontSize: 'var(--text-sm)',
        fontStyle: 'italic'
      }}>
        ✍️ Signature area - Click to sign
      </div>
      <div className="signature-actions" style={{
        marginTop: 'var(--space-2)',
        display: 'flex',
        gap: 'var(--space-2)'
      }}>
        <button 
          disabled 
          className="btn btn--secondary btn--sm"
          style={{ opacity: 0.5 }}
        >
          Clear
        </button>
        <button 
          disabled 
          className="btn btn--secondary btn--sm"
          style={{ opacity: 0.5 }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default PreviewSignature;
