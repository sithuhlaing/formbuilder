import React from 'react';
import type { FormComponentData, FormPage } from '../../types';
import Modal from '../../Modal';
import PreviewForm from './PreviewForm';
import { usePreviewForm } from '../../../hooks/usePreviewForm';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  components: FormComponentData[];
  pages?: FormPage[];
  showNotification?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  templateName,
  components,
  pages = [],
  showNotification,
}) => {
  const { handleSubmit } = usePreviewForm({ showNotification });

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
        pages={pages}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
};

export default PreviewModal;