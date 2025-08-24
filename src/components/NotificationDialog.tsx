import React from 'react';
import Modal from './Modal';

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}) => {
  const footer = (
    <button onClick={onClose} className="btn btn--primary">
      {buttonText}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      size="small"
      footer={footer}
    >
      <p style={{ 
        color: 'var(--color-gray-600)', 
        whiteSpace: 'pre-line',
        lineHeight: 'var(--line-height-relaxed)',
        margin: 0
      }}>
        {message}
      </p>
    </Modal>
  );
};

export default NotificationDialog;