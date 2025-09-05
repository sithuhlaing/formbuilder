/**
 * Optimized App - Performance-First Architecture  
 * Features: Lazy loading, memoization, centralized state management
 */

import React, { useCallback, memo, useEffect, useRef } from 'react';
import { useAppState } from './hooks/useAppState';
import { SimpleFormBuilder } from './components/SimpleFormBuilder';
import { LazyTemplateListView } from './components/LazyComponents';
import { templateService } from './features/template-management';
import { Button, Modal } from './shared/components';
import { useSimpleFormBuilder } from './hooks/useSimpleFormBuilder';
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
  const formBuilderHook = useSimpleFormBuilder();
  const { 
    templateName,
    components,
    mode,
    editingTemplateId,
    importJSON: loadJSONData,
    exportJSON,
    clearAll,
    setEditMode
  } = formBuilderHook;

  // Memoized handlers for better performance
  const handleSave = useCallback((isAutoSave = false) => {
    try {
      // Create template with simple structure
      const templateData = {
        name: templateName || 'Untitled Form',
        pages: [{
          id: 'page-1',
          title: 'Page 1', 
          components: components
        }]
      };

      if (mode === 'edit' && editingTemplateId) {
        // Edit mode: Update existing template
        const updatedTemplate = templateService.updateTemplate(editingTemplateId, templateData);
        
        if (updatedTemplate) {
          console.log('Template updated:', updatedTemplate);
          // Only show success modal for manual saves, not auto-saves
          if (!isAutoSave) {
            actions.showSuccess(
              'Template Updated',
              `Template "${updatedTemplate.name}" has been updated successfully.`
            );
          }
        } else {
          actions.showError(
            'Update Failed',
            'Failed to update template. Please try again.'
          );
        }
      } else {
        // Create mode: Create new template and switch to edit mode
        const newTemplate = templateService.saveTemplate(templateData);
        
        if (newTemplate) {
          console.log('Template created:', newTemplate);
          
          // 🔑 KEY CHANGE: Switch to edit mode for the newly created template
          setEditMode(newTemplate.templateId);
          
          actions.showSuccess(
            'Template Created',
            `New template "${newTemplate.name}" has been created successfully.`
          );
        } else {
          actions.showError(
            'Save Failed',
            'Failed to create template. Please try again.'
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
  }, [templateName, components, mode, editingTemplateId, setEditMode, actions]);

  // Auto-save functionality - debounced save when title or components change
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef({ templateName: '', componentsCount: 0 });

  const autoSave = useCallback(() => {
    // Only auto-save in edit mode (after first manual save)
    if (mode === 'edit' && editingTemplateId) {
      // Check if there are actual changes
      const currentComponentsCount = components.length;
      const hasChanges = 
        templateName !== lastSavedRef.current.templateName ||
        currentComponentsCount !== lastSavedRef.current.componentsCount;

      if (hasChanges) {
        console.log('🔄 Auto-saving template changes...');
        handleSave(true); // Pass true for auto-save
        lastSavedRef.current = { 
          templateName, 
          componentsCount: currentComponentsCount 
        };
      }
    }
  }, [mode, editingTemplateId, templateName, components, handleSave]);

  // Auto-save when title or components change (with 1 second debounce)
  useEffect(() => {
    if (mode === 'edit' && editingTemplateId) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 1000); // 1 second debounce
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [templateName, components, mode, editingTemplateId, autoSave]);

  const handleJSONUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonData = e.target?.result as string;
      loadJSONData(jsonData);
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Export template layout JSON (headless JSON for form data)
  const handleExportJSON = useCallback(() => {
    try {
      const jsonString = exportJSON();
      const dataBlob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName || 'form-template'}.json`;
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
  }, [exportJSON, templateName, actions]);

  const handleBackToList = useCallback(() => {
    actions.setView('list');
  }, [actions]);

  const handleTemplateSelect = useCallback((template: FormTemplate) => {
    console.log('🎯 Opening template for editing:', template.name);
    
    // Load template data into simple form builder
    if (template.pages && template.pages.length > 0) {
      const firstPage = template.pages[0];
      if (firstPage.components) {
        loadJSONData(JSON.stringify({
          templateName: template.name,
          components: firstPage.components
        }));
      }
    }
    
    // Set edit mode with the template ID
    setEditMode(template.templateId);
    actions.setView('builder');
  }, [loadJSONData, setEditMode, actions]);

  // Template List View
  if (state.currentView === 'list') {
    return (
      <div className="app">
        <LazyTemplateListView
          onCreateNew={() => {
            // Clear form state for new template
            clearAll();
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

      {/* Simple Form Builder - Phase 5 Integration */}
      <SimpleFormBuilder
        // Pass the hook data to SimpleFormBuilder to share state
        formBuilderHook={formBuilderHook}
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