
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";
import Properties from "./components/Properties";
import PreviewModal from "./components/molecules/PreviewModal";
import { useFormBuilder } from "./hooks/useFormBuilder";
import { templateService } from "./services/templateService";
import type { FormTemplateType } from "./components/types";

const App: React.FC = () => {
  const [templateType, setTemplateType] = useState<FormTemplateType>("assessment");
  const [showPreview, setShowPreview] = useState(false);
  
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
    loadFromJSON,
    insertComponentWithPosition,
    insertBetweenComponents,
    insertHorizontalToComponent,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useFormBuilder();

  const handleSave = () => {
    const savedTemplate = templateService.save(templateName, components, templateType);
    alert(`Template "${templateName}" saved successfully!\nJSON Schema generated with ${Object.keys(savedTemplate.jsonSchema?.properties || {}).length} fields.`);
  };

  const handleExport = () => templateService.exportJSON(templateName, components, templateType);
  const handlePreview = () => setShowPreview(true);

  const handleJSONUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonData = e.target?.result as string;
      const result = templateService.loadFromJSON(jsonData);
      
      if (result.error) {
        alert(`Error loading JSON: ${result.error}`);
        return;
      }
      
      if (result.components) {
        if (components.length > 0) {
          const shouldReplace = window.confirm(
            'Loading this JSON will replace your current form. Do you want to continue?\n\nYou can undo this action with Ctrl+Z after loading.'
          );
          if (!shouldReplace) return;
        }
        
        loadFromJSON(
          result.components,
          result.template?.name,
          result.template?.type
        );
        
        if (result.template?.type) {
          setTemplateType(result.template.type);
        }
        
        alert(`Successfully loaded ${result.components.length} components${result.template ? ` from template "${result.template.name}"` : ''}`);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input to allow same file upload again
  };

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
        />
      </div>
    </DndProvider>
  );
};

export default App;
