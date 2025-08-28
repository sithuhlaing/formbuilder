import { useState } from 'react';
import { useFormBuilder } from './useFormBuilder';
import { loadAndMigrateTemplates } from '../utils/templateMigration';
import type { Template, FormComponentData } from '../types';

export interface AppLogicReturn {
  currentView: 'list' | 'builder';
  setCurrentView: (view: 'list' | 'builder') => void;
  currentTemplateId: string | null;
  setCurrentTemplateId: (id: string | null) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  formBuilder: ReturnType<typeof useFormBuilder>;
  handleSave: () => void;
  handleExportSchema: () => void;
  handleCreateNew: () => void;
  handleEditTemplate: (templateId: string) => void;
  handleDeleteTemplate: (templateId: string) => void;
  handleBackToTemplates: () => void;
  handleUpdateComponent: (id: string, updates: Partial<FormComponentData>) => void;
  handleClearAll: () => void;
  handleLoadJSON: () => void;
  showNotification: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  showConfirmation: (title: string, message: string, onConfirm: () => void) => void;
  loadFromTemplate: (template: Template) => void;
}

export function useAppLogic(): AppLogicReturn {
  const [currentView, setCurrentView] = useState<'list' | 'builder'>('list');
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>(loadAndMigrateTemplates);

  const showNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    if (type === 'error') {
      alert(`Error: ${title}\n${message}`);
    }
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
  };

  const formBuilder = useFormBuilder({ showNotification, showConfirmation });

  const loadFromTemplate = (template: Template) => {
    // Handle both old and new template format
    const templateData = {
      pages: template.pages && template.pages.length > 0 
        ? template.pages 
        : [{
            id: '1',
            title: 'Page 1',
            components: template.fields || [],
            layout: {}
          }],
      currentPageId: template.pages?.[0]?.id || '1',
      templateName: template.name,
    };
    formBuilder.loadFromJSON(JSON.stringify(templateData));
  };

  const handleSave = () => {
    if (!currentTemplateId) return;
    
    const updatedTemplate: Template = {
      templateId: currentTemplateId,
      name: formBuilder.templateName,
      pages: formBuilder.pages,
      // Keep backward compatibility
      fields: formBuilder.currentPage?.components || [],
      createdDate: templates.find(t => t.templateId === currentTemplateId)?.createdDate || new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      type: 'assessment',
      jsonSchema: null,
      currentView: 'desktop'
    };
    
    setTemplates(templates.map(t => 
      t.templateId === currentTemplateId ? updatedTemplate : t
    ));
    showNotification('Template Saved', 'Your changes have been saved successfully.', 'success');
  };

  const handleExportSchema = () => {
    const dataStr = JSON.stringify({ 
      name: formBuilder.templateName, 
      pages: formBuilder.pages 
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${formBuilder.templateName.replace(/\s+/g, '_')}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCreateNew = () => {
    // Check if we should clear the form first
    const shouldClear = localStorage.getItem('__clearFormBeforeNew') === 'true';
    localStorage.removeItem('__clearFormBeforeNew');
    
    const newTemplate: Template = {
      templateId: Date.now().toString(),
      name: 'Untitled Template',
      pages: [{
        id: '1',
        title: 'Page 1',
        components: [],
        layout: {}
      }],
      fields: [], // For backward compatibility
      type: 'assessment',
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      jsonSchema: null,
      currentView: 'desktop'
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    setCurrentTemplateId(newTemplate.templateId);
    
    if (shouldClear) {
      formBuilder.clearAllSilent();
    }
    
    loadFromTemplate(newTemplate);
    setCurrentView('builder');
  };

  const handleEditTemplate = (templateId: string) => {
    const templateToEdit = templates.find(t => t.templateId === templateId);
    if (templateToEdit) {
      setCurrentTemplateId(templateId);
      loadFromTemplate(templateToEdit);
      setCurrentView('builder');
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    const templateToDelete = templates.find(t => t.templateId === templateId);
    if (!templateToDelete) return;
    
    showConfirmation(
      'Confirm Deletion',
      `Are you sure you want to delete "${templateToDelete.name}"? This action cannot be undone.`,
      () => {
        setTemplates(templates.filter(t => t.templateId !== templateId));
        showNotification('Template Deleted', 'The template has been successfully deleted.', 'success');
      }
    );
  };

  const handleBackToTemplates = () => {
    setCurrentView('list');
    setCurrentTemplateId(null);
  };

  const handleUpdateComponent = (id: string, updates: Partial<FormComponentData>) => {
    formBuilder.updateComponent(id, updates);
  };

  const handleClearAll = () => {
    showConfirmation(
      'Clear All Components',
      'Are you sure you want to clear all components? This action cannot be undone.',
      () => {
        formBuilder.clearAll();
        showNotification('Components Cleared', 'All components have been cleared from the form.', 'success');
      }
    );
  };

  const handleLoadJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonString = e.target?.result as string;
            formBuilder.loadFromJSON(jsonString);
            showNotification('JSON Loaded', 'Template loaded successfully from JSON file.', 'success');
          } catch (error) {
            showNotification('Load Error', 'Failed to load JSON file. Please check the file format.', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return {
    currentView,
    setCurrentView,
    currentTemplateId,
    setCurrentTemplateId,
    templates,
    setTemplates,
    formBuilder,
    handleSave,
    handleExportSchema,
    handleCreateNew,
    handleEditTemplate,
    handleDeleteTemplate,
    handleBackToTemplates,
    handleUpdateComponent,
    handleClearAll,
    handleLoadJSON,
    showNotification,
    showConfirmation,
    loadFromTemplate
  };
}