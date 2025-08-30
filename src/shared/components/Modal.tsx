/**
 * Modal Component - Reusable modal wrapper
 */

import React, { type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'small' | 'medium' | 'large';
  footer?: ReactNode;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  footer,
  children
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl', 
    large: 'max-w-4xl'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal ${sizeClasses[size]}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2>{title}</h2>
          <button 
            className="modal__close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="modal__content">
          {children}
        </div>
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};