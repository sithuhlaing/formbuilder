/**
 * Optimized App - Performance-First Architecture  
 * Features: Lazy loading, memoization, centralized state management
 */

import React, { useCallback, memo } from 'react';
import { useAppState } from './hooks/useAppState';
import { OptimizedFormBuilder } from './components/OptimizedFormBuilder';
import { LazyTemplateListView } from './components/LazyComponents';
import { templateService } from './features/template-management';
import { Button, Modal } from './shared/components';
import { useFormBuilder } from './features/form-builder';
import type { FormTemplate } from './types';

// Styles
import './styles/main.css';

// Loading component
const LoadingSpinner = memo(() => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <span>Loading...</span>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

const App: React.FC = () => {
  const { state, actions } = useAppState();
  const formBuilderHook = useFormBuilder();
  const { loadTemplate, loadFromJSON, clearForNewTemplate } = formBuilderHook;

  // Memoized handlers for better performance
  const handleSave = useCallback(() => {
    try {
      const { formState } = formBuilderHook;
      if (formState.templateId) {
        // Update existing template - convert pages to template format
        const templatePages = formState.pages.map((page, index) => ({
          ...page,
          layout: page.layoutConfig || {},
          order: index
        }));
        
        const updated = templateService.updateTemplate(formState.templateId, {
          name: formState.templateName || 'Untitled Form',
          pages: templatePages
        });
        
        if (updated) {
          console.log('Template updated:', updated);
          actions.showSuccess(
            'Template Updated',
            `Template "${updated.name}" has been updated successfully.`
          );
        } else {
          actions.showError(
            'Update Failed',
            'Failed to update template. Please try again.'
          );
        }
      } else {
        // Create new template
        const templatePages = formState.pages.map((page, index) => ({
          ...page,
          layout: page.layoutConfig || {},
          order: index
        }));
        
        const newTemplate = templateService.saveTemplate({
          name: formState.templateName || 'Untitled Form',
          pages: templatePages
        });
        
        if (newTemplate) {
          console.log('Template created:', newTemplate);
          actions.showSuccess(
            'Template Saved',
            `Template "${newTemplate.name}" has been saved successfully.`
          );
        } else {
          actions.showError(
            'Save Failed',
            'Failed to save template. Please try again.'
          );
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      actions.showError(
        'Save Error',
        'An error occurred while saving. Please try again.'
      );
    }
  }, [formBuilderHook, actions]);


  const handleJSONUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonData = e.target?.result as string;
      loadFromJSON(jsonData);
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Export template layout JSON (headless JSON for form data)
  const handleExportJSON = useCallback(() => {
    try {
      const { formState } = formBuilderHook;
      const templateData = {
        templateName: formState.templateName,
        pages: formState.pages
      };
      
      const dataStr = JSON.stringify(templateData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formState.templateName || 'form-template'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      actions.showSuccess(
        'Export Successful',
        'Form template has been exported successfully.'
      );
    } catch (error) {
      console.error('Export error:', error);
      actions.showError(
        'Export Failed',
        'Failed to export template. Please try again.'
      );
    }
  }, [formBuilderHook, actions]);

  const handleBackToList = useCallback(() => {
    actions.setView('list');
  }, [actions]);

  const handleTemplateSelect = useCallback((template: FormTemplate) => {
    loadTemplate(template);
    actions.setView('builder');
  }, [loadTemplate, actions]);

  // Template List View
  if (state.currentView === 'list') {
    return (
      <div className="app">
        <LazyTemplateListView
          onCreateNew={() => {
            // Clear form state for new template
            clearForNewTemplate();
            actions.setView('builder');
          }}
          onEditTemplate={handleTemplateSelect}
        />
      </div>
    );
  }

  // Form Builder View - COMPLETE
  return (
    <div className="app">
      {/* Header */}
      <div className="app-header">
        <div className="app-header__left">
          <Button 
            onClick={handleBackToList}
            variant="secondary"
            className="back-button"
          >
            ← Back to Templates
          </Button>
        </div>
        
        <div className="app-header__center">
          <h1 className="app-title">Form Builder</h1>
        </div>
        
        <div className="app-header__right">
          <Button onClick={handleExportJSON} variant="secondary">
            📤 Export JSON
          </Button>
          <label className="upload-button">
            📁 Upload JSON
            <input
              type="file"
              accept=".json"
              onChange={handleJSONUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Optimized Form Builder */}
      <OptimizedFormBuilder
        onSave={handleSave}
        onExport={handleExportJSON}
        onPreview={() => actions.togglePreview(true)}
        showPreview={state.showPreview}
        onClosePreview={() => actions.togglePreview(false)}
      />

      {/* Success Modal */}
      <Modal
        isOpen={state.successModal.isOpen}
        onClose={actions.closeSuccess}
        title={state.successModal.title}
      >
        <p>{state.successModal.message}</p>
        <div className="modal-actions">
          <Button onClick={actions.closeSuccess} variant="primary">
            OK
          </Button>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={state.errorModal.isOpen}
        onClose={actions.closeError}
        title={state.errorModal.title}
      >
        <p>{state.errorModal.message}</p>
        <div className="modal-actions">
          <Button onClick={actions.closeError} variant="primary">
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default App;