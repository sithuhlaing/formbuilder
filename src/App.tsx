/**
 * Complete App - Feature-Based Architecture  
 * Full functionality: Template list, form builder with all tools
 */

import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Canvas, 
  ComponentPalette, 
  PreviewModal,
  DeleteZone,
  useFormBuilder 
} from './features/form-builder';
import { PropertiesPanel } from './shared/components/PropertiesPanel';
import type { FormComponentData } from './types/component';
import { TemplateListView, templateService } from './features/template-management';
import { Button, Modal } from './shared/components';

// Styles
import './styles/main.css';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'builder'>('list');
  const [showPreview, setShowPreview] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });
  
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });
  
  const {
    formState,
    currentComponents,
    selectedComponent,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    clearAll,
    handleDrop,
    moveComponent,
    addToRowLayout,
    getCurrentPageIndex,
    navigateToNextPage,
    navigateToPreviousPage,
    addNewPage,
    handleFormSubmit,
    undo,
    redo,
    canUndo,
    canRedo,
    loadFromJSON,
    loadTemplate
  } = useFormBuilder();

  // Actions for form builder
  const handleSave = () => {
    try {
      if (formState.templateId) {
        // Update existing template - convert pages to template format
        const templatePages = formState.pages.map((page, index) => ({
          ...page,
          layout: page.layoutConfig || {},
          order: index
        }));
        
        const updated = templateService.updateTemplate(formState.templateId, {
          name: formState.templateName,
          pages: templatePages
        });
        
        if (updated) {
          console.log('Template updated:', updated);
          setSuccessModal({
            isOpen: true,
            title: 'Template Updated',
            message: `Template "${formState.templateName}" updated successfully!`
          });
        } else {
          throw new Error('Failed to update template');
        }
      } else {
        // Create new template - convert pages to template format
        const templatePages = formState.pages.map((page, index) => ({
          ...page,
          layout: page.layoutConfig || {},
          order: index
        }));
        
        const saved = templateService.saveTemplate({
          name: formState.templateName,
          type: 'other',
          fields: [],
          pages: templatePages,
          jsonSchema: {}
        });
        console.log('Template saved:', saved);
        setSuccessModal({
          isOpen: true,
          title: 'Template Saved',
          message: `Template "${formState.templateName}" saved successfully!`
        });
      }
    } catch (error) {
      console.error('Template save failed:', error);
      setErrorModal({
        isOpen: true,
        title: 'Save Failed',
        message: 'Failed to save template. Please try again.'
      });
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all components?')) {
      clearAll();
    }
  };

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
  const handleExportJSON = () => {
    const templateData = {
      templateName: formState.templateName,
      pages: formState.pages
    };
    
    const jsonString = JSON.stringify(templateData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formState.templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  // Template List View
  if (currentView === 'list') {
    return (
      <div className="app">
        <TemplateListView
          onCreateNew={() => {
            // Clear form if requested
            if (localStorage.getItem('__clearFormBeforeNew')) {
              clearAll();
              localStorage.removeItem('__clearFormBeforeNew');
            }
            setCurrentView('builder');
          }}
          onEditTemplate={(template) => {
            console.log('Loading template for editing:', template.name);
            loadTemplate(template);
            setCurrentView('builder');
          }}
        />
      </div>
    );
  }

  // Form Builder View - COMPLETE
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        {/* Header with all tools */}
        <header className="header">
          <div className="header__container">
            <div className="header__brand">
              <h1>Form Builder</h1>
            </div>
            <div className="header__actions">
              <Button 
                onClick={() => setCurrentView('list')}
                variant="secondary"
                size="small"
              >
                ← Back to Templates
              </Button>
              
              <div className="divider-vertical" />
              
              <Button
                onClick={undo}
                variant="secondary"
                size="small" 
                disabled={!canUndo}
              >
                ↶ Undo
              </Button>
              
              <Button
                onClick={redo}
                variant="secondary"
                size="small"
                disabled={!canRedo}
              >
                ↷ Redo
              </Button>
              
              <div className="divider-vertical" />
              
              <label className="btn btn--secondary btn--small">
                📁 Load JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJSONUpload}
                  className="hidden"
                />
              </label>
              
              <Button
                onClick={handleClearAll}
                variant="secondary"
                size="small"
                disabled={currentComponents.length === 0}
              >
                Clear All
              </Button>
              
              <Button
                onClick={() => setShowPreview(true)}
                variant="secondary"
                size="small"
                disabled={currentComponents.length === 0}
              >
                Preview
              </Button>
              
              <Button
                onClick={handleExportJSON}
                variant="secondary"
                size="small"
                disabled={currentComponents.length === 0}
              >
                Export JSON
              </Button>
              
              <Button
                onClick={handleSave}
                variant="primary"
                size="small"
                disabled={currentComponents.length === 0}
              >
                Save Template
              </Button>
            </div>
          </div>
        </header>

        <main className="main">
          {/* Left Sidebar with Component Palette */}
          <aside className="sidebar">
            <ComponentPalette onAddComponent={addComponent} />
          </aside>

          {/* Canvas Area */}
          <section className="canvas">
            <div className="canvas__header">
              <div className="canvas__title-section">
                <h1 className="canvas__title">
                  {formState.templateName}
                </h1>
                <div className="canvas__page-info">
                  Page {getCurrentPageIndex() + 1} of {formState.pages.length}
                </div>
              </div>
              
              {/* Page Navigation */}
              <div className="canvas__page-navigation">
                {formState.pages.length > 1 && (
                  <>
                    <button 
                      className="btn btn--secondary"
                      onClick={navigateToPreviousPage}
                      disabled={getCurrentPageIndex() === 0}
                    >
                      ← Previous
                    </button>
                    
                    {getCurrentPageIndex() < formState.pages.length - 1 ? (
                      <button 
                        className="btn btn--primary"
                        onClick={navigateToNextPage}
                      >
                        Next →
                      </button>
                    ) : (
                      <button 
                        className="btn btn--success"
                        onClick={handleFormSubmit}
                      >
                        Submit Form
                      </button>
                    )}
                  </>
                )}
                
                <button 
                  className="btn btn--outline"
                  onClick={addNewPage}
                >
                  + Add Page
                </button>
              </div>
            </div>
            
            {/* Canvas Content */}
            <div className="canvas__content">
              <Canvas
                components={currentComponents}
                onDrop={handleDrop}
                onSelect={selectComponent}
                onMove={moveComponent}
                onDelete={deleteComponent}
                onAddToLayout={addToRowLayout}
                selectedId={formState.selectedComponentId || undefined}
              />
            </div>
          </section>

          {/* Properties Panel */}
          <aside className="properties">
            <PropertiesPanel
              selectedComponent={selectedComponent}
              onUpdateComponent={(componentId: string, updates: Partial<FormComponentData>) => {
                updateComponent(componentId, updates);
              }}
            />
          </aside>
        </main>

        {/* Delete Zone - Outside Canvas Area */}
        <DeleteZone onDelete={deleteComponent} />

        {/* Preview Modal */}
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          templateName={formState.templateName}
          components={currentComponents}
          pages={formState.pages}
        />

        {/* Success Modal */}
        <Modal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
          title={successModal.title}
          size="small"
        >
          <div className="text-center py-4">
            <div className="text-green-600 text-4xl mb-4">✅</div>
            <p className="text-gray-700">{successModal.message}</p>
          </div>
        </Modal>

        {/* Error Modal */}
        <Modal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
          title={errorModal.title}
          size="small"
        >
          <div className="text-center py-4">
            <div className="text-red-600 text-4xl mb-4">❌</div>
            <p className="text-gray-700">{errorModal.message}</p>
          </div>
        </Modal>
      </div>
    </DndProvider>
  );
};

export default App;