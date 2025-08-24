import React from 'react';
import SimpleModal from './SimpleModal';
import ButtonGroup from './ButtonGroup';
import { Button } from '../atoms';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info';
}

const TYPE_ICONS = {
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <ButtonGroup>
      <Button variant="secondary" onClick={onClose}>
        {cancelText}
      </Button>
      <Button 
        variant={type === 'error' ? 'danger' : 'primary'} 
        onClick={handleConfirm}
      >
        {confirmText}
      </Button>
    </ButtonGroup>
  );

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={TYPE_ICONS[type]}
      footer={footer}
    >
      <p className="text-gray-700 whitespace-pre-line">
        {message}
      </p>
    </SimpleModal>
  );
};

export default ConfirmDialog;