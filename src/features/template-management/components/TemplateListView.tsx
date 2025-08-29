/**
 * Template List View - Comprehensive template management
 */

import React, { useState, useEffect } from 'react';
import { templateService } from '../services/templateService';
import { ActionButton, Button } from '../../../shared/components';
import { PreviewModal } from '../../form-builder';
import type { FormTemplate, FormTemplateType } from '../../../types';

interface TemplateListViewProps {
  onCreateNew: () => void;
  onEditTemplate: (template: FormTemplate) => void;
}

export const TemplateListView: React.FC<TemplateListViewProps> = ({
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
    const savedTemplates = templateService.getAllTemplates();
    setTemplates(savedTemplates);
  }, []);

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    setDeleteConfirmation({ isOpen: true, templateId, templateName });
  };

  const confirmDeleteTemplate = () => {
    templateService.deleteTemplate(deleteConfirmation.templateId);
    setTemplates(templateService.getAllTemplates());
    setDeleteConfirmation({ isOpen: false, templateId: '', templateName: '' });
  };

  const handlePreviewTemplate = (template: FormTemplate) => {
    console.log('Template preview clicked:', template.name, 'Components:', template.pages?.[0]?.components?.length || 0);
    setPreviewTemplate(template);
  };

  const handleDuplicateTemplate = (template: FormTemplate) => {
    const duplicatedTemplate = templateService.saveTemplate({
      name: `${template.name} (Copy)`,
      pages: template.pages
    });
    setTemplates(templateService.getAllTemplates());
    alert(`Template duplicated as "${duplicatedTemplate.name}"`);
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

  const getTypeColor = (type: FormTemplateType) => {
    switch (type) {
      case 'assessment': return '#dbeafe'; // Blue
      case 'referral': return '#dcfce7';   // Green  
      case 'compliance': return '#fed7aa'; // Orange
      case 'other': return '#f3f4f6';      // Gray
      default: return '#f3f4f6';
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
          <div className="template-list-header__actions">
            <Button
              onClick={() => {
                // Clear form before creating new
                localStorage.setItem('__clearFormBeforeNew', 'true');
                onCreateNew();
              }}
              variant="secondary"
              size="large"
            >
              🧹 Clear & New
            </Button>
            <Button
              onClick={onCreateNew}
              variant="primary"
              size="large"
            >
              + Create New Form
            </Button>
          </div>
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
                Get started by creating your first form template with our drag-and-drop builder
              </p>
              <Button
                onClick={onCreateNew}
                variant="primary"
                size="large"
              >
                Create Your First Form
              </Button>
            </div>
          ) : (
            <div className="template-grid">
              {templates.map((template) => (
                <div key={template.id} className="template-card">
                  <div className="template-card__header">
                    <div className="template-card__title-section">
                      <h3 className="template-card__title">{template.name}</h3>
                      <span 
                        className="template-card__type-badge"
                        style={{ backgroundColor: getTypeColor('assessment') }}
                      >
                        assessment
                      </span>
                    </div>
                    <div className="template-card__actions">
                      <ActionButton
                        onClick={(e) => {
                          e?.stopPropagation();
                          console.log('🔍 Edit button clicked for:', template.name);
                          onEditTemplate(template);
                        }}
                        icon="✏️"
                        title="Edit template"
                      />
                      <ActionButton
                        onClick={(e) => {
                          e?.stopPropagation();
                          handlePreviewTemplate(template);
                        }}
                        icon="👁️"
                        title="Preview template"
                      />
                      <ActionButton
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleDuplicateTemplate(template);
                        }}
                        icon="📋"
                        title="Duplicate template"
                      />
                      <ActionButton
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleDeleteTemplate(template.id, template.name);
                        }}
                        icon="🗑️"
                        title="Delete template"
                      />
                    </div>
                  </div>
                  
                  <div className="template-card__content">
                    <div className="template-card__stats">
                      <div className="template-card__stat">
                        <span className="template-card__stat-value">
                          {template.pages?.[0]?.components?.length || 0}
                        </span>
                        <span className="template-card__stat-label">Components</span>
                      </div>
                      <div className="template-card__stat">
                        <span className="template-card__stat-value">
                          {template.pages?.length || 1}
                        </span>
                        <span className="template-card__stat-label">Pages</span>
                      </div>
                    </div>
                    
                    <div className="template-card__meta">
                      <div className="template-card__date">
                        Created: {formatDate(template.createdAt)}
                      </div>
                      {template.updatedAt !== template.createdAt && (
                        <div className="template-card__date">
                          Updated: {formatDate(template.updatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="template-card__footer">
                    <Button
                      onClick={() => onEditTemplate(template)}
                      variant="primary"
                      size="sm"
                    >
                      Open Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmation({ isOpen: false, templateId: '', templateName: '' })}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Delete Template</h2>
            </div>
            <div className="modal__content">
              <p>Are you sure you want to delete the template "{deleteConfirmation.templateName}"?</p>
              <p className="text-gray-500">This action cannot be undone.</p>
            </div>
            <div className="modal__footer">
              <Button
                onClick={() => setDeleteConfirmation({ isOpen: false, templateId: '', templateName: '' })}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteTemplate}
                variant="primary"
              >
                Delete Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          templateName={previewTemplate.name}
          components={previewTemplate.pages?.[0]?.components || []}
        />
      )}
    </div>
  );
};