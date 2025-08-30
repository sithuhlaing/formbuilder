/**
 * Preview Modal Component - Modal wrapper for form preview with multi-page support
 */

import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { PreviewForm } from './PreviewForm';
import type { FormComponentData } from '../../../types';
import type { FormPage } from '../../../core/FormState';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  components?: FormComponentData[];
  pages?: FormPage[];
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  templateName,
  components = [],
  pages = []
}) => {
  const [submitModal, setSubmitModal] = useState<{
    isOpen: boolean;
    data: Record<string, any> | null;
  }>({ isOpen: false, data: null });

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Preview form submitted:', data);
    setSubmitModal({ isOpen: true, data });
  };

  const isMultiPage = pages.length > 0;
  const totalPages = isMultiPage ? pages.length : 1;

  const modalFooter = (
    <div className="flex justify-between items-center text-sm text-gray-500">
      <span>This is a preview mode. No data will be actually submitted.</span>
      {isMultiPage && (
        <span className="font-medium">
          Multi-page form ({totalPages} page{totalPages !== 1 ? 's' : ''})
        </span>
      )}
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
        onSubmit={handleFormSubmit}
      />
      
      {/* Form Submission Success Modal */}
      <Modal
        isOpen={submitModal.isOpen}
        onClose={() => setSubmitModal({ isOpen: false, data: null })}
        title="Form Submitted Successfully"
        size="medium"
      >
        <div className="text-center py-4">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <p className="text-gray-700 mb-4">Your form has been submitted successfully!</p>
          <details className="text-left">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mb-2">
              View submitted data
            </summary>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
              {JSON.stringify(submitModal.data, null, 2)}
            </pre>
          </details>
        </div>
      </Modal>
    </Modal>
  );
};