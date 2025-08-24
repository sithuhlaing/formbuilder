import { useState } from 'react';

export interface NotificationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onConfirm: () => void;
}

export const useModals = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  });

  const showNotification = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    setNotification({ isOpen: true, title, message, type });
  };

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'info' | 'success' | 'warning' | 'error' = 'warning'
  ) => {
    setConfirmation({ isOpen: true, title, message, type, onConfirm });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const closeConfirmation = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  return {
    notification,
    confirmation,
    showNotification,
    showConfirmation,
    closeNotification,
    closeConfirmation
  };
};