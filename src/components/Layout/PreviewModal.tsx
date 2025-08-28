import React from 'react';
import type { FormComponentData, FormPage } from '../../types';
import FormComponentRenderer from '../molecules/forms/FormComponentRenderer';
import { PageNavigation } from '../molecules';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: FormPage[];
  currentPageId: string;
  onSwitchPage: (pageId: string) => void;
  templateName: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  pages,
  currentPageId,
  onSwitchPage,
  templateName
}) => {
  if (!isOpen) {
    return null;
  }

  const currentPage = pages.find(p => p.id === currentPageId);
  const componentsToRender = currentPage ? currentPage.components : [];

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <h2>{templateName} - Preview</h2>
          <button onClick={onClose} className="preview-modal-close-button">&times;</button>
        </div>
        <div className="preview-modal-body">
          {pages.length > 1 && (
            <PageNavigation
              pages={pages}
              currentPageId={currentPageId}
              onSwitchPage={onSwitchPage}
            />
          )}
          {componentsToRender.map(component => (
            <div key={component.id} className="form-component-renderer">
              <FormComponentRenderer component={component} path={[component.id]} isPreview={true} />
            </div>
          ))}
          {componentsToRender.length === 0 && (
            <p>This page is empty.</p>
          )}
        </div>
        <div className="preview-modal-footer">
          <button onClick={onClose}>Close Preview</button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;