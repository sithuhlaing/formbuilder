import React from 'react';

interface NotificationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
  onClose: () => void;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({
  isOpen,
  title,
  message,
  type,
  buttonText,
  onClose
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10b981', color: 'white' };
      case 'error':
        return { backgroundColor: '#ef4444', color: 'white' };
      case 'warning':
        return { backgroundColor: '#f59e0b', color: 'white' };
      default:
        return { backgroundColor: '#3b82f6', color: 'white' };
    }
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
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          ...getTypeStyles(),
          padding: '8px 12px',
          borderRadius: '4px',
          marginBottom: '16px',
          fontWeight: '600'
        }}>
          {title}
        </div>
        <p style={{ margin: '0 0 20px 0', lineHeight: '1.5' }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            float: 'right'
          }}
        >
          {buttonText || 'OK'}
        </button>
      </div>
    </div>
  );
};

export default NotificationDialog;