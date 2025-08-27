import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'danger';
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  type,
  onConfirm,
  onClose,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '1.25rem',
          fontWeight: 600,
          color: type === 'danger' ? '#d32f2f' : '#ff9800'
        }}>
          {title}
        </h3>
        <p style={{ 
          color: 'var(--color-gray-600)', 
          whiteSpace: 'pre-line',
          lineHeight: 'var(--line-height-relaxed)',
          margin: '0 0 24px 0'
        }}>
          {message}
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px' 
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={handleConfirm}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: type === 'danger' ? '#d32f2f' : '#ff9800',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;