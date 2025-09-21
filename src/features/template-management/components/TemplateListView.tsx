/**
 * Template List View - Comprehensive template management
 */

import React, { useState, useEffect } from 'react';
import { templateService } from '../services/templateService';
import { ActionButton, Button, Modal } from '../../../shared/components';
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
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: '' });

  // Refresh templates whenever the component mounts or when returning from builder
  useEffect(() => {
    const refreshTemplates = () => {
      try {
        const savedTemplates = templateService.getAllTemplates();
        setTemplates(savedTemplates || []);
      } catch (error) {
        console.error('Failed to load templates:', error);
        setTemplates([]); // Fallback to empty array
      }
    };

    // Load templates immediately
    refreshTemplates();

    // Also refresh when the window gains focus (user returns from builder)
    const handleFocus = () => refreshTemplates();
    window.addEventListener('focus', handleFocus);
    
    // Set up a periodic refresh to catch auto-saves
    const intervalId = setInterval(refreshTemplates, 2000); // Every 2 seconds

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
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
    setSuccessModal({
      isOpen: true,
      message: `Template duplicated as "${duplicatedTemplate.name}"`
    });
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
                <div key={template.templateId} className="template-card">
                  <div className="template-card__header">
                    <div className="template-card__actions">
                      {[
                        {
                          key: 'edit',
                          icon: '✏️',
                          title: 'Edit template',
                          onClick: (e?: React.MouseEvent) => {
                            e?.stopPropagation();
                            console.log('🔍 Edit button clicked for:', template.name);
                            onEditTemplate(template);
                          }
                        },
                        {
                          key: 'preview',
                          icon: '👁️',
                          title: 'Preview template',
                          onClick: (e?: React.MouseEvent) => {
                            e?.stopPropagation();
                            handlePreviewTemplate(template);
                          }
                        },
                        {
                          key: 'duplicate',
                          icon: '📋',
                          title: 'Duplicate template',
                          onClick: (e?: React.MouseEvent) => {
                            e?.stopPropagation();
                            handleDuplicateTemplate(template);
                          }
                        },
                        {
                          key: 'delete',
                          icon: '🗑️',
                          title: 'Delete template',
                          onClick: (e?: React.MouseEvent) => {
                            e?.stopPropagation();
                            handleDeleteTemplate(template.templateId, template.name);
                          }
                        }
                      ].map((action) => (
                        <ActionButton
                          key={`${action.key}-${template.templateId}`}
                          onClick={action.onClick}
                          icon={action.icon}
                          title={action.title}
                        />
                      ))}
                    </div>
                    <div className="template-card__title-section">
                      <h3 className="template-card__title">{template.name}</h3>
                      <span
                        className="template-card__type-badge"
                        style={{ backgroundColor: getTypeColor(template.type || 'assessment') }}
                      >
                        {template.type || 'assessment'}
                      </span>
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
                        Created: {formatDate(template.createdDate)}
                      </div>
                      {template.modifiedDate !== template.createdDate && (
                        <div className="template-card__date">
                          Updated: {formatDate(template.modifiedDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="template-card__footer">
                    <Button
                      onClick={() => {
                        console.log('🔍 Open Template button clicked for:', template.name);
                        onEditTemplate(template);
                      }}
                      variant="primary"
                      size="small"
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
          pages={previewTemplate.pages?.map((page, index) => ({
            ...page,
            id: page.id || `page-${index}`,
            order: index + 1
          })) || []}
        />
      )}

      {/* Success Modal */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Success"
        size="small"
      >
        <div className="text-center py-4">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <p className="text-gray-700">{successModal.message}</p>
        </div>
      </Modal>
    </div>
  );
};