import React from 'react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  icon
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return 'var(--color-green-500)';
      case 'warning':
        return 'var(--color-orange-500)';
      case 'error':
        return 'var(--color-red-500)';
      case 'info':
      default:
        return 'var(--color-blue-500)';
    }
  };

  return (
    <div 
      className="confirmation-modal-overlay" 
      onClick={onClose}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        zIndex: 9999,
        backdropFilter: 'blur(2px)'
      }}
    >
      <div 
        className="confirmation-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: 'scale(1.05)',
          animation: 'modalBounce 0.3s ease-out'
        }}
      >
        <div className="confirmation-modal__header">
          <div 
            className="confirmation-modal__icon"
            style={{ color: getTypeColor() }}
          >
            {getTypeIcon()}
          </div>
          <h3 className="confirmation-modal__title">{title}</h3>
        </div>

        <div className="confirmation-modal__body">
          <p className="confirmation-modal__message">{message}</p>
        </div>

        <div className="confirmation-modal__footer">
          <button
            onClick={onClose}
            className="btn btn--secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`btn ${
              type === 'error' ? 'btn--danger' : 
              type === 'warning' ? 'btn--warning' : 
              type === 'success' ? 'btn--success' : 'btn--primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;