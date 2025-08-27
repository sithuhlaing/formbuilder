import { useState, useCallback } from 'react';

interface NotificationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: 'info' | 'success' | 'warning' | 'error' | 'danger';
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
    onConfirm: () => {},
    type: 'warning'
  });

  const showNotification = useCallback((
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setNotification({
      isOpen: true,
      title,
      message,
      type
    });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirmation = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'info' | 'success' | 'warning' | 'error' | 'danger' = 'warning'
  ) => {
    setConfirmation({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    notification,
    confirmation,
    showNotification,
    showConfirmation,
    closeNotification,
    closeConfirmation
  };
};
