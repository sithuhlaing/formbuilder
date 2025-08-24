import React from 'react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getButtonClass = () => {
    switch (type) {
      case 'error': return 'btn btn--danger';
      case 'warning': return 'btn btn--warning';
      case 'success': return 'btn btn--success';
      default: return 'btn btn--primary';
    }
  };

  const footer = (
    <>
      <button onClick={onClose} className="btn btn--secondary">
        {cancelText}
      </button>
      <button onClick={handleConfirm} className={getButtonClass()}>
        {confirmText}
      </button>
    </>
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

export default ConfirmDialog;