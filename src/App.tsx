import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Properties from './components/Properties';
import PreviewModal from './components/molecules/PreviewModal';
import PageNavigation from './components/molecules/PageNavigation';
import TemplateListView from './components/TemplateListView';
import ConfirmationModal from './components/molecules/ConfirmationModal';
import NotificationModal from './components/molecules/NotificationModal';
import { useFormBuilder } from './hooks/useFormBuilder';
import { useModals } from './hooks/useModals';
import { templateService } from './services/templateService';
import type { 
  FormTemplateType, 
  FormTemplate, 
  ComponentType,
  FormComponentData
} from "./components/types";

// A helper function to find and update components recursively
const findAndModifyComponent = (
  components: FormComponentData[],
  targetId: string,
  modification: (component: FormComponentData) => FormComponentData
): FormComponentData[] => {
  return components.map(component => {
    if (component.id === targetId) {
      return modification(component);
    }
    if (component.children) {
      return {
        ...component,
        children: findAndModifyComponent(component.children, targetId, modification),
      };
    }
    return component;
  });
};

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
    clearAll,
    clearAllSilent,
    loadFromJSON,
    insertComponentWithPosition,
    insertBetweenComponents,
    insertHorizontalToComponent,
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
  } = useFormBuilder({ showConfirmation, showNotification });

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
    const loadTemplate = () => {
      console.log('✅ Loading template:', template.name, 'Fields:', template.fields.length, 'Pages:', template.pages?.length);
      loadFromJSON(template.fields, template.name, template.type, template.pages);
      setTemplateType(template.type);
      setCurrentTemplateId(template.templateId); // Set template ID for editing
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
    
    if (hasAnyComponents) {
      console.log('⚠️ Showing confirmation dialog for template replacement');
      const totalComponents = pages.reduce((total, page) => total + page.components.length, 0);
      
      // Add a slight delay to ensure state is clean
      setTimeout(() => {
        showConfirmation(
          '🔄 Replace Current Form?',
          `You have ${totalComponents} component(s) in your current form.\n\nClick "Continue" to replace with "${template.name}" template.\n\n(You can undo this with Ctrl+Z after loading)`,
          forceLoadTemplate, // Use force load to ensure clean slate
          'warning'
        );
      }, 100);
    } else {
      console.log('✅ Loading template directly (no existing components)');
      loadTemplate();
    }
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
        showNotification(
          'Error Loading JSON',
          `Error loading JSON: ${result.error}`,
          'error'
        );
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
          
          showNotification(
            'JSON Loaded Successfully!',
            `Successfully loaded ${result.components!.length} components${result.template ? ` from template "${result.template.name}"` : ''}.`,
            'success'
          );
        };

        const hasAnyComponents = pages.some(page => page.components.length > 0);
        
        if (hasAnyComponents) {
          showConfirmation(
            'Replace Current Form?',
            'Loading this JSON will replace your current form. Do you want to continue?\n\nYou can undo this action with Ctrl+Z after loading.',
            loadJSON,
            'warning'
          );
        } else {
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
    // Use the addComponent function from useFormBuilder
    // This will need to be enhanced in useFormBuilder to handle container drops
    console.log('Drop in container:', item, containerId);
    // For now, just add to main canvas
    addComponent(item.type);
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
              <span className="header__brand-subtitle">
                Build dynamic forms with drag & drop
              </span>
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
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar__header">
              <h2>Components</h2>
            </div>
            <div className="sidebar__content">
              <Sidebar onAddComponent={addComponent} />
            </div>
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
                onMoveComponent={moveComponent}
                onAddComponent={addComponent}
                onInsertWithPosition={insertComponentWithPosition}
                onInsertBetween={insertBetweenComponents}
                onInsertHorizontal={insertHorizontalToComponent}
                onDropInContainer={handleDropInContainer}
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
                component={selectedComponent}
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
        
        {/* Confirmation Modal */}
        {console.log('🔍 RENDERING CONFIRMATION MODAL:', { 
          isOpen: confirmation.isOpen, 
          title: confirmation.title 
        })}
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          onClose={closeConfirmation}
          onConfirm={confirmation.onConfirm}
          title={confirmation.title}
          message={confirmation.message}
          type={confirmation.type}
          confirmText="Continue"
          cancelText="Cancel"
        />
        
        {/* DEBUG: Force show modal state */}
        {confirmation.isOpen && (
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px', 
            background: 'red',
            color: 'white',
            padding: '10px',
            zIndex: 99999,
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            🚨 MODAL SHOULD BE OPEN: {confirmation.title}
          </div>
        )}
        
        {/* Notification Modal */}
        <NotificationModal
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
