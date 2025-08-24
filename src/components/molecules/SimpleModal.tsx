import React from 'react';
import ModalOverlay from '../atoms/modals/ModalOverlay';
import ModalHeader from '../atoms/modals/ModalHeader';
import ModalBody from '../atoms/modals/ModalBody';
import ModalFooter from '../atoms/modals/ModalFooter';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const SimpleModal: React.FC<SimpleModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  className = ""
}) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}>
        <ModalHeader title={title} icon={icon} onClose={onClose} />
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </div>
    </ModalOverlay>
  );
};

export default SimpleModal;