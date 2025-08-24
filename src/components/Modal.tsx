import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  type?: 'default' | 'info' | 'success' | 'warning' | 'error';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  type = 'default'
}) => {
  if (!isOpen) return null;

  const getSizeStyle = () => {
    switch (size) {
      case 'small': return { maxWidth: '400px' };
      case 'large': return { maxWidth: '1200px' };
      case 'fullscreen': return { maxWidth: '95vw', maxHeight: '95vh' };
      default: return { maxWidth: '800px' };
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success': return 'var(--color-green-500)';
      case 'warning': return 'var(--color-orange-500)';
      case 'error': return 'var(--color-red-500)';
      case 'info': return 'var(--color-blue-500)';
      default: return 'var(--color-gray-600)';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        style={getSizeStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {getTypeIcon() && (
                <span 
                  style={{ 
                    fontSize: '1.5rem',
                    color: getTypeColor() 
                  }}
                >
                  {getTypeIcon()}
                </span>
              )}
              <h2 className="modal-title">{title}</h2>
            </div>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div style={{ 
            padding: 'var(--space-4) var(--space-6) var(--space-6) var(--space-6)',
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
            borderTop: '1px solid var(--color-gray-200)'
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;