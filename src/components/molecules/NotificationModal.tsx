import React from 'react';

export interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  buttonText?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  icon,
  buttonText = 'OK'
}) => {
  if (!isOpen) return null;

  const getTypeIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return '🎉';
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
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notification-modal__header">
          <div 
            className="notification-modal__icon"
            style={{ color: getTypeColor() }}
          >
            {getTypeIcon()}
          </div>
          <h3 className="notification-modal__title">{title}</h3>
        </div>

        <div className="notification-modal__body">
          <p className="notification-modal__message">{message}</p>
        </div>

        <div className="notification-modal__footer">
          <button
            onClick={onClose}
            className={`btn ${
              type === 'error' ? 'btn--danger' : 
              type === 'warning' ? 'btn--warning' : 
              type === 'success' ? 'btn--success' : 'btn--primary'
            }`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;