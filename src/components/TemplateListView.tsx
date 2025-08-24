import React, { useState, useEffect } from 'react';
import { templateService } from '../services/templateService';
import PreviewModal from './molecules/PreviewModal';
import ConfirmationModal from './molecules/ConfirmationModal';
import ActionButton from './atoms/ActionButton';
import type { FormTemplate } from './types';

interface TemplateListViewProps {
  onCreateNew: () => void;
  onEditTemplate: (template: FormTemplate) => void;
}

const TemplateListView: React.FC<TemplateListViewProps> = ({
  onCreateNew,
  onEditTemplate
}) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    templateId: string;
    templateName: string;
  }>({ isOpen: false, templateId: '', templateName: '' });

  useEffect(() => {
    const savedTemplates = templateService.getTemplates();
    setTemplates(savedTemplates);
  }, []);

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    setDeleteConfirmation({ isOpen: true, templateId, templateName });
  };

  const confirmDeleteTemplate = () => {
    const savedTemplates = templateService.getTemplates();
    const updatedTemplates = savedTemplates.filter(t => t.templateId !== deleteConfirmation.templateId);
    localStorage.setItem('formTemplates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    setDeleteConfirmation({ isOpen: false, templateId: '', templateName: '' });
  };

  const handlePreviewTemplate = (template: FormTemplate) => {
    setPreviewTemplate(template);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assessment': return 'var(--color-blue-100)';
      case 'referral': return 'var(--color-green-100)';
      case 'compliance': return 'var(--color-orange-100)';
      default: return 'var(--color-gray-100)';
    }
  };

  return (
    <div className="template-list-view">
      {/* Header */}
      <header className="template-list-header">
        <div className="template-list-header__container">
          <div className="template-list-header__content">
            <h1 className="template-list-header__title">Form Templates</h1>
            <p className="template-list-header__subtitle">
              Create and manage your form templates
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="btn btn--primary btn--lg"
          >
            + Create New Form
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="template-list-content">
        <div className="template-list-content__container">
          {templates.length === 0 ? (
            <div className="template-list-empty">
              <div className="template-list-empty__icon">📋</div>
              <h2 className="template-list-empty__title">No templates yet</h2>
              <p className="template-list-empty__description">
                Get started by creating your first form template
              </p>
              <button
                onClick={onCreateNew}
                className="btn btn--primary"
              >
                Create Your First Form
              </button>
            </div>
          ) : (
            <div className="template-grid">
              {templates.map((template) => (
                <div key={template.templateId} className="template-card">
                  <div className="template-card__header">
                    <div className="template-card__title-section">
                      <h3 className="template-card__title">{template.name}</h3>
                      <span 
                        className="template-card__type-badge"
                        style={{ backgroundColor: getTypeColor(template.type) }}
                      >
                        {template.type}
                      </span>
                    </div>
                    <div className="template-card__actions">
                      <ActionButton
                        onClick={() => onEditTemplate(template)}
                        icon="✏️"
                        title="Edit template"
                      />
                      <ActionButton
                        onClick={() => handlePreviewTemplate(template)}
                        icon="👁️"
                        title="Preview template"
                      />
                      <ActionButton
                        onClick={() => handleDeleteTemplate(template.templateId, template.name)}
                        icon="🗑️"
                        title="Delete template"
                        variant="delete"
                      />
                    </div>
                  </div>
                  
                  <div className="template-card__info">
                    <div className="template-card__stat">
                      <span className="template-card__stat-label">Fields:</span>
                      <span className="template-card__stat-value">{template.fields.length}</span>
                    </div>
                    <div className="template-card__stat">
                      <span className="template-card__stat-label">Pages:</span>
                      <span className="template-card__stat-value">{template.pages?.length || 1}</span>
                    </div>
                    <div className="template-card__stat">
                      <span className="template-card__stat-label">Created:</span>
                      <span className="template-card__stat-value">{formatDate(template.createdDate)}</span>
                    </div>
                  </div>

                  <div className="template-card__preview">
                    {template.fields.slice(0, 3).map((field, index) => (
                      <div key={index} className="template-card__field">
                        <span className="template-card__field-type">
                          {field.type.replace('_', ' ')}
                        </span>
                        <span className="template-card__field-label">
                          {field.label}
                        </span>
                      </div>
                    ))}
                    {template.fields.length > 3 && (
                      <div className="template-card__field-more">
                        +{template.fields.length - 3} more fields
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          isOpen={true}
          onClose={() => setPreviewTemplate(null)}
          templateName={previewTemplate.name}
          components={previewTemplate.fields}
          pages={previewTemplate.pages}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, templateId: '', templateName: '' })}
        onConfirm={confirmDeleteTemplate}
        title="Delete Template"
        message={`Are you sure you want to delete the template "${deleteConfirmation.templateName}"?\n\nThis action cannot be undone.`}
        type="error"
        confirmText="Delete"
        cancelText="Cancel"
        icon="🗑️"
      />
    </div>
  );
};

export default TemplateListView;