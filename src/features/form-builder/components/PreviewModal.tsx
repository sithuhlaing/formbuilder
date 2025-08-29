/**
 * Preview Modal Component - Modal wrapper for form preview
 */

import React from 'react';
import { Modal } from '../../../shared/components/Modal';
import { PreviewForm } from './PreviewForm';
import type { FormComponentData } from '../../../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  components: FormComponentData[];
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  templateName,
  components
}) => {
  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Preview form submitted:', data);
    alert(`Form submitted successfully!\n\nData: ${JSON.stringify(data, null, 2)}`);
  };

  const modalFooter = (
    <div className="text-sm text-gray-500">
      This is a preview mode. No data will be actually submitted.
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`👁️ Preview: ${templateName}`}
      size="large"
      footer={modalFooter}
    >
      <PreviewForm
        templateName={templateName}
        components={components}
        onSubmit={handleFormSubmit}
      />
    </Modal>
  );
};