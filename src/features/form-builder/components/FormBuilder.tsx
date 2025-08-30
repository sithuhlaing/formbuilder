import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useFormBuilder } from '../hooks/useFormBuilder';
import { ComponentPalette } from './ComponentPalette';
import { FormPageCard } from './FormPageCard';
import { CanvasCard } from './CanvasCard';
import { PropertiesPanel } from './PropertiesPanel';

export const FormBuilder: React.FC = () => {
  const {
    formState,
    currentComponents,
    selectedComponent,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    handleDrop,
    moveComponent,
    setTemplateName,
    getCurrentPageIndex,
    navigateToNextPage,
    navigateToPreviousPage,
    addNewPage,
    handleFormSubmit,
    updatePageTitle
  } = useFormBuilder();

  const currentPageIndex = getCurrentPageIndex();
  const currentPage = formState.pages[currentPageIndex];
  const isLastPage = currentPageIndex === formState.pages.length - 1;
  const canGoBack = currentPageIndex > 0;
  const canGoNext = currentPageIndex < formState.pages.length - 1;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="form-builder" data-testid="form-builder">
        {/* Form Builder Top Navigation Bar */}
        <div className="form-builder__top-nav">
          <div className="top-nav-actions">
            <button 
              className="nav-btn nav-btn--secondary"
              onClick={() => {/* TODO: Implement Load JSON */}}
              title="Load JSON template"
            >
              📁 Load JSON
            </button>
            <button 
              className="nav-btn nav-btn--secondary"
              onClick={() => {/* TODO: Implement Clear All */}}
              title="Clear all components"
            >
              🗑️ Clear All
            </button>
            <button 
              className="nav-btn nav-btn--primary"
              onClick={() => {/* TODO: Implement Preview */}}
              title="Preview form"
            >
              👁️ Preview
            </button>
            <button 
              className="nav-btn nav-btn--primary"
              onClick={() => {/* TODO: Implement Export JSON */}}
              title="Export as JSON"
            >
              💾 Export JSON
            </button>
            <div className="nav-divider"></div>
            <button 
              className="nav-btn nav-btn--outline"
              onClick={() => {/* TODO: Implement Undo */}}
              title="Undo last action"
            >
              ↶ Undo
            </button>
            <button 
              className="nav-btn nav-btn--outline"
              onClick={() => {/* TODO: Implement Redo */}}
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
              formTitle={formState.templateName || 'Untitled Form'}
              onFormTitleChange={setTemplateName}
              currentPageIndex={currentPageIndex}
              totalPages={formState.pages.length}
              currentPageTitle={currentPage?.title || 'Untitled Page'}
              onPreviousPage={navigateToPreviousPage}
              onNextPage={navigateToNextPage}
              onSubmit={handleFormSubmit}
              onAddPage={addNewPage}
              canGoBack={canGoBack}
              canGoNext={canGoNext}
              isLastPage={isLastPage}
              onUpdatePageTitle={(title) => updatePageTitle(currentPage?.id || '', title)}
            />

            {/* Card 2: Canvas Area */}
            <CanvasCard
              components={currentComponents}
              onDrop={handleDrop}
              onSelect={selectComponent}
              onDelete={deleteComponent}
              onMove={moveComponent}
              selectedId={selectedComponent?.id}
            />
          </div>

          {/* Properties Panel */}
          <div className="form-builder__properties">
            <PropertiesPanel
              selectedComponent={selectedComponent}
              onUpdateComponent={(updates) => 
                selectedComponent && updateComponent(selectedComponent.id, updates)
              }
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
