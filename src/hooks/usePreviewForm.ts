
import { useState } from 'react';

interface UsePreviewFormProps {
  onSubmit?: (data: Record<string, any>) => void;
  showNotification?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const usePreviewForm = ({ onSubmit, showNotification }: UsePreviewFormProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default preview behavior
        if (showNotification) {
          showNotification(
            'Form Submitted',
            'This is a preview. Form data would be submitted in the actual form.',
            'info'
          );
        } else {
          alert('This is a preview. Form data would be submitted in the actual form.');
        }
      }
    } catch (error) {
      if (showNotification) {
        showNotification(
          'Submission Error',
          'An error occurred while submitting the form.',
          'error'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
