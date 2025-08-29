/**
 * Complete App - Feature-Based Architecture  
 * Full functionality: Template list, form builder with all tools
 */

import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Clean feature imports - single sources of truth
import { 
  Canvas, 
  ComponentPalette, 
  PropertiesPanel,
  PreviewModal,
  useFormBuilder 
} from './features/form-builder';
import { TemplateListView, templateService } from './features/template-management';
import { Button } from './shared/components';

// Types
import type { ComponentType } from './types';

// Styles
import './styles/main.css';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'builder'>('list');
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState(() => templateService.getAllTemplates());
  
  const {
    formState,
    currentComponents,
    selectedComponent,
    addComponent,
    updateComponent,
    selectComponent,
    handleDrop,
    setTemplateName,
    undo,
    redo,
    canUndo,
    canRedo,
    clearAll,
    loadFromJSON
  } = useFormBuilder();

  // Actions for form builder
  const handleSave = () => {
    const saved = templateService.saveTemplate({
      name: formState.templateName,
      pages: formState.pages
    });
    console.log('Template saved:', saved);
    // Refresh templates list
    setTemplates(templateService.getAllTemplates());
    // Show success message or redirect to list
    alert(`Template "${formState.templateName}" saved successfully!`);
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

  // Export advanced schema with layout and styling information
  const handleExportSchema = () => {
    const advancedSchema = {
      templateName: formState.templateName,
      pages: formState.pages,
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        type: 'advanced-layout-schema'
      },
      layout: {
        type: 'responsive',
        breakpoints: {
          mobile: '768px',
          tablet: '1024px',
          desktop: '1200px'
        }
      },
      styling: {
        theme: 'default',
        colors: {
          primary: '#3B82F6',
          secondary: '#64748B',
          background: '#FFFFFF',
          text: '#1F2937'
        }
      }
    };
    
    const jsonString = JSON.stringify(advancedSchema, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formState.templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_schema.json`;
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
            console.log('Loading template:', template.name);
            loadFromJSON(JSON.stringify({
              templateName: template.name,
              pages: template.pages
            }));
            setTemplates(templateService.getAllTemplates()); // Refresh templates
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
                size="sm"
              >
                ← Back to Templates
              </Button>
              
              <div className="divider-vertical" />
              
              <Button
                onClick={undo}
                variant="secondary"
                size="sm" 
                disabled={!canUndo}
              >
                ↶ Undo
              </Button>
              
              <Button
                onClick={redo}
                variant="secondary"
                size="sm"
                disabled={!canRedo}
              >
                ↷ Redo
              </Button>
              
              <div className="divider-vertical" />
              
              <label className="btn btn--secondary btn--sm">
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
                size="sm"
                disabled={currentComponents.length === 0}
              >
                Clear All
              </Button>
              
              <Button
                onClick={() => setShowPreview(true)}
                variant="secondary"
                size="sm"
                disabled={currentComponents.length === 0}
              >
                Preview
              </Button>
              
              <Button
                onClick={handleExportJSON}
                variant="secondary"
                size="sm"
                disabled={currentComponents.length === 0}
              >
                Export JSON
              </Button>
              
              <Button
                onClick={handleSave}
                variant="primary"
                size="sm"
                disabled={currentComponents.length === 0}
              >
                Save Template
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main">
          {/* Left Sidebar with Component Palette */}
          <aside className="sidebar">
            <ComponentPalette onAddComponent={addComponent} />
          </aside>

          {/* Canvas Area */}
          <section className="canvas">
            <div className="canvas__header">
              <div className="flex flex--between flex--align-center">
                <input
                  type="text"
                  value={formState.templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="canvas__title-input field-group--inline"
                  placeholder="Form Name"
                  style={{ 
                    flex: 1, 
                    marginRight: '1rem',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
                <div className="flex flex--align-center flex--gap-2">
                  <label className="field-group__label field-label--compact">Type:</label>
                  <select
                    className="select input--auto-width"
                    defaultValue="assessment"
                  >
                    <option value="assessment">Assessment</option>
                    <option value="referral">Referral</option>
                    <option value="compliance">Compliance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Pages Navigation */}
            <div className="canvas__pages">
              <div className="page-navigation">
                <div className="page-navigation__header">
                  <h3 className="page-navigation__title">
                    <span className="page-navigation__icon">📄</span>
                    Pages
                  </h3>
                  <Button
                    variant="primary"
                    size="sm"
                    className="page-navigation__add-btn"
                  >
                    + Add Page
                  </Button>
                </div>
                <div className="page-navigation__list">
                  <div className="page-navigation__item page-navigation__item--active">
                    <div className="page-navigation__item-content">
                      <div className="page-navigation__item-header">
                        <span className="page-navigation__item-number">1</span>
                        <span className="page-navigation__item-title">Page 1</span>
                      </div>
                      <div className="page-navigation__item-info">
                        {currentComponents.length} components
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Canvas Content */}
            <div className="canvas__content">
              <Canvas
                components={currentComponents}
                onDrop={handleDrop}
                onSelect={selectComponent}
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