import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ComponentPalette from './components/ComponentPalette/ComponentPalette';
import Canvas from './components/Canvas/components/DragDropReorderingCanvas';
import Properties from './components/Properties';
import PreviewModal from './components/molecules/forms/PreviewModal';
import PageNavigation from './components/molecules/navigation/PageNavigation';
import TemplateListView from './components/TemplateListView';
import ConfirmDialog from './components/ConfirmDialog';
import NotificationDialog from './components/NotificationDialog';
import { useFormBuilder } from './hooks/useFormBuilder';
import { useModals } from './hooks/useModals';
import { templateService } from './services/templateService';
import type { 
  FormTemplateType, 
  FormTemplate, 
  ComponentType
} from "./types";
import './styles/layout.css';
import './styles/component-palette.css';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'builder'>('list');
  const [templateType, setTemplateType] = useState<FormTemplateType>("assessment");
  const [showPreview, setShowPreview] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  
  // Modal management
  const {
    notification,
    confirmation,
    showNotification,
    showConfirmation,
    closeNotification,
    closeConfirmation
  } = useModals();
  
  const {
    components,
    selectedComponent,
    selectedComponentId,
    templateName,
    setTemplateName,
    addComponent,
    selectComponent,
    updateComponent,
    deleteComponent,
    moveComponent,
    createComponent,
    clearAll,
    clearAllSilent,
    loadFromJSON,
    insertBetweenComponents,
    insertHorizontalToComponent,
    addComponentToContainerWithPosition,
    rearrangeWithinContainer,
    removeFromContainer,
    moveFromContainerToCanvas,
    pages,
    currentPageId,
    addPage,
    deletePage,
    updatePageTitle,
    switchToPage,
    clearPage,
    canUndo,
    canRedo,
    undo,
    redo,
    updateCurrentPageComponents,
  } = useFormBuilder({ showConfirmation, showNotification });

  // Debug currentView changes
  useEffect(() => {
    console.log('🔄 currentView changed to:', currentView);
  }, [currentView]);

  const handleSave = () => {
    console.log('Saving template:', {
      templateName,
      components: components.length,
      pages: pages.map(p => ({ id: p.id, title: p.title, componentCount: p.components.length })),
      currentTemplateId
    });
    const savedTemplate = templateService.save(templateName, components, templateType, pages, currentTemplateId || undefined);
    console.log('Saved template result:', {
      templateId: savedTemplate.templateId,
      fieldCount: savedTemplate.fields?.length,
      pageCount: savedTemplate.pages?.length
    });
    const fieldCount = Object.keys(savedTemplate.jsonSchema?.properties || {}).length;
    
    if (currentTemplateId) {
      showNotification(
        'Template Updated!',
        `Template "${templateName}" has been updated successfully.\n\nJSON Schema generated with ${fieldCount} fields.`,
        'success'
      );
    } else {
      showNotification(
        'Template Saved!',
        `Template "${templateName}" has been saved successfully.\n\nJSON Schema generated with ${fieldCount} fields.`,
        'success'
      );
    }
  };

  const handleExport = () => templateService.exportJSON(templateName, components, templateType, pages);
  const handleExportSchema = () => templateService.exportLayoutSchema(templateName, components, templateType, pages);
  const handlePreview = () => {
    console.log('Preview clicked - Components:', components.length, 'Pages:', pages.length);
    setShowPreview(true);
  };

  const handleCreateNew = () => {
    // Check if we should force clear (from debug helper)
    const shouldClear = localStorage.getItem('__clearFormBeforeNew');
    if (shouldClear) {
      localStorage.removeItem('__clearFormBeforeNew');
      console.log('🧹 Force clearing form before creating new');
    }
    
    clearAllSilent();
    setTemplateName("Untitled Form");
    setTemplateType("assessment");
    setCurrentTemplateId(null); // Clear template ID for new form
    setCurrentView('builder');
  };

  const handleEditTemplate = (template: FormTemplate) => {
    console.log('🖱️ EDIT BUTTON CLICKED for template:', template.name);
    console.log('📊 Template data received:', {
      templateId: template.templateId,
      name: template.name,
      type: template.type,
      fieldsCount: template.fields?.length || 0,
      pagesCount: template.pages?.length || 0,
      createdDate: template.createdDate
    });
    const loadTemplate = () => {
      console.log('✅ Loading template:', template.name, 'Fields:', template.fields?.length || 0, 'Pages:', template.pages?.length);
      loadFromJSON(template.fields || [], template.name, template.type, template.pages);
      setTemplateType(template.type);
      setCurrentTemplateId(template.templateId); // Set template ID for editing
      console.log('🔄 Setting currentView to builder...');
      setCurrentView('builder');
    };

    const forceLoadTemplate = () => {
      console.log('🔄 Force loading template (clearing current form)');
      clearAllSilent(); // Clear current form first
      setTimeout(() => {
        loadTemplate(); // Then load the template
      }, 100); // Small delay to ensure state update
    };

    const hasAnyComponents = pages.some(page => page.components.length > 0);
    console.log('🔍 Edit template check:', { 
      templateName: template.name,
      totalPages: pages.length,
      hasAnyComponents,
      pageComponents: pages.map(page => page.components.length)
    });
    
    // Temporarily bypass modal and load directly for testing
    console.log('⚠️ Loading template directly (bypassing modal for debugging)');
    const totalComponents = pages.reduce((total, page) => total + page.components.length, 0);
    
    console.log('🔄 About to force load template:', {
      templateName: template.name,
      templateId: template.templateId,
      fieldsCount: template.fields?.length || 0,
      pagesCount: template.pages?.length || 0,
      currentComponents: totalComponents
    });
    
    forceLoadTemplate();
  };

  const handleBackToList = () => {
    console.log('🔙 Going back to template list');
    const totalComponents = pages.reduce((total, page) => total + page.components.length, 0);
    console.log(`📊 Current form has ${totalComponents} components when going back`);
    
    setCurrentTemplateId(null); // Clear template ID when going back to list
    setCurrentView('list');
  };

  const handleJSONUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonData = e.target?.result as string;
      const result = templateService.loadFromJSON(jsonData);
      
      if (result.error) {
        console.log('❌ Error Loading JSON:', `Error loading JSON: ${result.error}`);
        return;
      }
      
      if (result.components) {
        const loadJSON = () => {
          loadFromJSON(
            result.components!,
            result.template?.name,
            result.template?.type,
            result.pages
          );
          
          if (result.template?.type) {
            setTemplateType(result.template.type);
          }
          
          setCurrentTemplateId(null); // Clear template ID for uploaded JSON
          
          console.log('✅ JSON Loaded Successfully:', `Successfully loaded ${result.components!.length} components${result.template ? ` from template "${result.template.name}"` : ''}.`);
        };

        const hasAnyComponents = pages.some(page => page.components.length > 0);
        
        if (hasAnyComponents) {
          console.log('⚠️ Replacing current form with JSON data');
          loadJSON();
        } else {
          console.log('📄 Loading JSON data (no existing form)');
          loadJSON();
        }
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input to allow same file upload again
  };

  const handleDropInContainer = (
    item: { type: ComponentType; id?: string },
    containerId: string
  ) => {
    console.log('Drop in container:', item, containerId);
    addComponentToContainerWithPosition(item.type, containerId, 'center');
  };

  const handleDropInContainerWithPosition = (
    item: { type: ComponentType; id?: string },
    containerId: string,
    position: 'left' | 'center' | 'right'
  ) => {
    console.log('Drop in container with position:', item, containerId, position);
    addComponentToContainerWithPosition(item.type, containerId, position);
  };

  // Show template list view
  if (currentView === 'list') {
    console.log('🏠 Rendering Template List View');
    return (
      <div className="app">
        <TemplateListView
          onCreateNew={handleCreateNew}
          onEditTemplate={handleEditTemplate}
        />
      </div>
    );
  }

  // Show form builder
  console.log('🏗️ Rendering Form Builder View');
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header__container">
            <div className="header__brand">
              <h1>Form Builder</h1>
            </div>
            <div className="header__actions">
              <button
                onClick={handleBackToList}
                className="btn btn--secondary btn--sm"
                title="Back to template list"
              >
                ← Back to Templates
              </button>
              <button
                onClick={() => {
                  console.log('🧹 MANUAL CLEAR - Before clearing, components:', components.length);
                  clearAllSilent();
                  console.log('✅ MANUAL CLEAR - Cleared all components');
                }}
                className="btn btn--warning btn--sm"
                title="Clear current form (debug helper)"
                style={{ backgroundColor: 'var(--color-orange-500)', color: 'white', marginLeft: '8px' }}
              >
                🧹 Clear
              </button>
              <div style={{ width: '1px', height: '20px', background: 'var(--color-gray-300)', margin: '0 var(--space-2)' }} />
              <button
                onClick={undo}
                disabled={!canUndo}
                className="btn btn--secondary btn--sm"
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="btn btn--secondary btn--sm"
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo
              </button>
              <div style={{ width: '1px', height: '20px', background: 'var(--color-gray-300)', margin: '0 var(--space-2)' }} />
              <label className="btn btn--secondary btn--sm" title="Upload JSON template or schema">
                📁 Load JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJSONUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                onClick={clearAll}
                disabled={components.length === 0}
                className="btn btn--secondary btn--sm"
              >
                Clear All
              </button>
              <button
                onClick={handlePreview}
                disabled={components.length === 0}
                className="btn btn--secondary btn--sm"
              >
                Preview
              </button>
              <button
                onClick={handleExport}
                disabled={components.length === 0}
                className="btn btn--secondary btn--sm"
              >
                Export JSON
              </button>
              <button
                onClick={handleExportSchema}
                disabled={components.length === 0}
                className="btn btn--secondary btn--sm"
                title="Export advanced layout schema"
              >
                Export Schema
              </button>
              <button
                onClick={handleSave}
                disabled={components.length === 0}
                className="btn btn--primary btn--sm"
              >
                Save Template
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main">
          {/* Component Palette */}
          <aside className="sidebar">
            <ComponentPalette onAddComponent={addComponent} />
          </aside>

          {/* Canvas */}
          <section className="canvas">
            <div className="canvas__header">
              <div className="flex flex--between flex--align-center">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="canvas__title-input"
                  placeholder="Form Name"
                  style={{ width: 'auto', flex: 1, marginRight: 'var(--space-4)' }}
                />
                <div className="flex flex--align-center flex--gap-2">
                  <label className="field-group__label" style={{ margin: 0, fontSize: 'var(--text-xs)' }}>Type:</label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as FormTemplateType)}
                    className="select"
                    style={{ width: 'auto', minWidth: '120px' }}
                  >
                    <option value="assessment">Assessment</option>
                    <option value="referral">Referral</option>
                    <option value="compliance">Compliance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="canvas__pages">
              <PageNavigation
                pages={pages}
                currentPageId={currentPageId}
                onSwitchPage={switchToPage}
                onAddPage={addPage}
                onDeletePage={deletePage}
                onUpdatePageTitle={updatePageTitle}
                onClearPage={clearPage}
              />
            </div>
            <div className="canvas__content">
              <Canvas
                components={components}
                selectedComponentId={selectedComponentId}
                onSelectComponent={selectComponent}
                onDeleteComponent={deleteComponent}
                onUpdateComponent={updateComponent}
                onMoveComponent={moveComponent}
                onAddComponent={addComponent}
                onUpdateComponents={updateCurrentPageComponents}
                onRemoveFromContainer={removeFromContainer}
                onMoveFromContainerToCanvas={moveFromContainerToCanvas}
                createComponent={createComponent}
              />
            </div>
          </section>

          {/* Properties Panel */}
          <aside className="properties">
            <div className="properties__header">
              <h2>Properties</h2>
            </div>
            <div className="properties__content">
              <Properties
                selectedComponent={selectedComponent}
                onUpdateComponent={updateComponent}
              />
            </div>
          </aside>
        </main>
        
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          templateName={templateName}
          components={components}
          pages={pages}
          showNotification={showNotification}
        />
        
        {/* Unified Modal System */}
        <ConfirmDialog
          isOpen={confirmation.isOpen}
          onClose={closeConfirmation}
          onConfirm={confirmation.onConfirm}
          title={confirmation.title}
          message={confirmation.message}
          type={confirmation.type}
          confirmText="Continue"
          cancelText="Cancel"
        />
        
        <NotificationDialog
          isOpen={notification.isOpen}
          onClose={closeNotification}
          title={notification.title}
          message={notification.message}
          type={notification.type}
          buttonText="OK"
        />
      </div>
    </DndProvider>
  );
};

export default App;