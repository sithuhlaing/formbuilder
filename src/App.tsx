/**
 * Complete App - Feature-Based Architecture  
 * Full functionality: Template list, form builder with all tools
 */

import React, { useState, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Canvas, 
  ComponentPalette, 
  PropertiesPanel,
  PreviewModal,
  DeleteZone,
  useFormBuilder 
} from './features/form-builder';
import { TemplateListView, templateService } from './features/template-management';
import { Button } from './shared/components';
import type { ComponentType } from './types';

// Styles
import './styles/main.css';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'builder'>('list');
  const [showPreview, setShowPreview] = useState(false);
  
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
    setTemplateName,
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
    if (formState.templateId) {
      // Update existing template
      const updated = templateService.updateTemplate(formState.templateId, {
        name: formState.templateName,
        pages: formState.pages
      });
      console.log('Template updated:', updated);
      alert(`Template "${formState.templateName}" updated successfully!`);
    } else {
      // Create new template
      const saved = templateService.saveTemplate({
        name: formState.templateName,
        pages: formState.pages
      });
      console.log('Template saved:', saved);
      alert(`Template "${formState.templateName}" saved successfully!`);
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

  // Export schema for testing - shows current form structure
  const handleExportSchema = () => {
    const currentPage = formState.pages.find(page => page.id === formState.currentPageId);
    const schemaData = {
      templateName: formState.templateName,
      components: currentPage?.components || [],
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    
    // Update schema output for tests
    const schemaOutput = document.getElementById('schema-output');
    if (schemaOutput) {
      schemaOutput.textContent = JSON.stringify(schemaData, null, 2);
    }
    
    console.log('📋 Schema exported:', schemaData);
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
                onClick={handleExportSchema}
                variant="secondary"
                size="small"
                disabled={currentComponents.length === 0}
              >
                Export Schema
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
                selectedId={formState.selectedComponentId || undefined}
              />
            </div>
          </section>

          {/* Properties Panel */}
          <aside className="properties">
            <div className="properties__header">
              <h2>Properties</h2>
            </div>
            <div className="properties__content">
              <PropertiesPanel
                selectedComponent={selectedComponent}
                onUpdateComponent={(updates) => {
                  if (selectedComponent) {
                    updateComponent(selectedComponent.id, updates);
                  }
                }}
              />
            </div>
          </aside>
        </main>

        {/* Delete Zone - Outside Canvas Area */}
        <DeleteZone onDelete={deleteComponent} />

        {/* Schema Output */}
        <pre id="schema-output"></pre>

        {/* Preview Modal */}
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          templateName={formState.templateName}
          components={currentComponents}
        />
      </div>
    </DndProvider>
  );
};

export default App;