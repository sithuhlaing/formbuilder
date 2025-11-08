import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ComponentPalette } from './ComponentPalette';
import { ComponentPropertiesPanel } from '../../../components/ComponentPropertiesPanel';
import { FormPageCard } from './FormPageCard';
import { CanvasCard } from './CanvasCard';
// import { DragLayer } from '../../../shared/components/DragLayer';
import { useFormBuilder } from '../hooks/useFormBuilder';

export const FormBuilder: React.FC = () => {
  const {
    pages,
    currentPageId,
    templateName,
    components: currentComponents,
    selectedId,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    moveComponent,
    setTemplateName,
    getCurrentPageIndex,
    navigateToNextPage,
    navigateToPreviousPage,
    addNewPage,
    clearAll,
    importJSON: loadFromJSON,
    exportJSON,
    undo,
    redo,
    canUndo,
    canRedo,
    previewMode: isPreviewMode,
    togglePreview
  } = useFormBuilder();

  const currentPageIndex = getCurrentPageIndex();
  const currentPage = pages[currentPageIndex];
  const isLastPage = currentPageIndex === pages.length - 1;

  // File operation helper functions
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
            loadFromJSON(jsonString);
          } catch (error) {
            console.error('Failed to load JSON file:', error);
            alert('Invalid JSON file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportJSON = () => {
    try {
      const jsonData = exportJSON();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.replace(/\s+/g, '_')}_template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export JSON:', error);
      alert('Failed to export template');
    }
  };
  const canGoBack = currentPageIndex > 0;
  const canGoNext = currentPageIndex < pages.length - 1;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="form-builder" data-testid="form-builder">
        {/* Form Builder Top Navigation Bar */}
        <div className="form-builder__top-nav">
          <div className="top-nav-actions">
            <button 
              className="nav-btn nav-btn--secondary"
              onClick={handleLoadJSON}
              title="Load JSON template"
            >
              📁 Load JSON
            </button>
            <button 
              className="nav-btn nav-btn--secondary"
              onClick={clearAll}
              title="Clear all components"
            >
              🗑️ Clear All
            </button>
            <button 
              className="nav-btn nav-btn--primary"
              onClick={togglePreview}
              title={isPreviewMode ? "Exit preview mode" : "Preview form"}
            >
              {isPreviewMode ? "🔙 Exit Preview" : "👁️ Preview"}
            </button>
            <button 
              className="nav-btn nav-btn--primary"
              onClick={handleExportJSON}
              title="Export as JSON"
            >
              💾 Export JSON
            </button>
            <div className="nav-divider"></div>
            <button 
              className="nav-btn nav-btn--outline"
              onClick={undo}
              disabled={!canUndo}
              title="Undo last action"
            >
              ↶ Undo
            </button>
            <button 
              className="nav-btn nav-btn--outline"
              onClick={redo}
              disabled={!canRedo}
              title="Redo last action"
            >
              ↷ Redo
            </button>
          </div>
        </div>

        {/* Main Form Builder Layout */}
        <div className="form-builder__layout">
          {/* Component Palette */}
          <div className="form-builder__sidebar">
            <ComponentPalette onAddComponent={addComponent} />
          </div>

          {/* Middle Panel - Two Card Structure */}
          <div className="form-builder__middle-panel">
            {/* Card 1: Form Title and Page Management */}
            <FormPageCard
              formTitle={templateName || 'Untitled Form'}
              onFormTitleChange={setTemplateName}
              currentPageIndex={currentPageIndex}
              totalPages={pages.length}
              currentPageTitle={currentPage?.title || 'Untitled Page'}
              onPreviousPage={navigateToPreviousPage}
              onNextPage={navigateToNextPage}
              onSubmit={() => {}}
              onAddPage={addNewPage}
              canGoBack={canGoBack}
              canGoNext={canGoNext}
              isLastPage={isLastPage}
              onUpdatePageTitle={(title) => {}}
            />

            {/* Card 2: Canvas Area */}
            <CanvasCard
              components={currentComponents}
              onDrop={() => {}}
              onSelect={selectComponent}
              onDelete={deleteComponent}
              onMove={moveComponent}
              onUpdateComponents={() => {}}
              selectedId={selectedId || undefined}
            />
          </div>

          {/* Properties Panel */}
          <div className="form-builder__properties">
            <ComponentPropertiesPanel
              selectedComponent={null}
              onUpdateComponent={updateComponent}
            />
          </div>
        </div>
        
        {/* Custom Drag Layer for Preview Fields */}
        {/* <DragLayer /> */}
      </div>
    </DndProvider>
  );
};
