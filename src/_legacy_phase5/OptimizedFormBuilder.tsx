/**
 * Optimized Form Builder Component
 * High-performance, memoized form builder with lazy loading
 */

import React, { memo, Suspense, useCallback, useMemo } from 'react';
import { useFormBuilder } from '../features/form-builder/hooks/useFormBuilder';
import { DeleteZone } from '../features/form-builder/components/DeleteZone';
import { FormWizardNavigation } from '../features/form-builder/components/FormWizardNavigation';
import { LazyCanvas, LazyComponentPalette, LazyPropertiesPanel, LazyPreviewModal } from './LazyComponents';
import { MobileDrawerManager } from './ResponsiveDrawers';
// Mobile drag-drop components moved to legacy in Phase 3
// import { MobileDragDropManager } from './MobileDragDropManager';
// import { TouchDragPreview } from './TouchDragPreview';
import type { FormComponentData, ComponentType } from '../types';

// Loading fallback component
const LoadingSpinner = memo(() => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <span>Loading...</span>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

interface OptimizedFormBuilderProps {
  onSave?: () => void;
  onExport?: () => void;
  onPreview?: () => void;
  showPreview?: boolean;
  onClosePreview?: () => void;
}

const OptimizedFormBuilder: React.FC<OptimizedFormBuilderProps> = memo(({
  onSave,
  onExport,
  onPreview,
  showPreview = false,
  onClosePreview
}) => {
  const formBuilderState = useFormBuilder();
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
    addToRowLayout,
    getCurrentPageIndex,
    navigateToNextPage,
    navigateToPreviousPage,
    addNewPage,
    undo,
    redo,
    canUndo,
    canRedo
  } = formBuilderState;

  // Memoized handlers to prevent unnecessary re-renders
  const handleComponentAdd = useCallback((componentType: ComponentType) => {
    addComponent(componentType);
  }, [addComponent]);

  const handleComponentUpdate = useCallback((updates: Partial<FormComponentData>) => {
    if (selectedComponent) {
      updateComponent(selectedComponent.id, updates);
    }
  }, [selectedComponent, updateComponent]);

  const handleComponentSelect = useCallback((componentId: string) => {
    selectComponent(componentId);
  }, [selectComponent]);

  const handleComponentDelete = useCallback((componentId: string) => {
    deleteComponent(componentId);
  }, [deleteComponent]);

  const handleComponentMove = useCallback((fromIndex: number, toIndex: number) => {
    moveComponent(fromIndex, toIndex);
  }, [moveComponent]);

  const handleLayoutAdd = useCallback((componentType: ComponentType, layoutId: string) => {
    addToRowLayout(componentType, layoutId);
  }, [addToRowLayout]);

  // Memoized toolbar actions
  const toolbarActions = useMemo(() => [
    { id: 'undo', onClick: undo, disabled: !canUndo, icon: '↶', title: 'Undo', variant: 'secondary' },
    { id: 'redo', onClick: redo, disabled: !canRedo, icon: '↷', title: 'Redo', variant: 'secondary' },
    { id: 'save', onClick: onSave, disabled: false, icon: '💾', title: 'Save', variant: 'primary' },
    { id: 'export', onClick: onExport, disabled: false, icon: '📤', title: 'Export', variant: 'secondary' },
    { id: 'preview', onClick: onPreview, disabled: false, icon: '👁️', title: 'Preview', variant: 'secondary' }
  ], [undo, redo, canUndo, canRedo, onSave, onExport, onPreview]);

  // Memoized wizard navigation props
  const wizardProps = useMemo(() => {
    const currentIndex = getCurrentPageIndex();
    const currentPage = formState.pages[currentIndex];
    return {
      currentPageIndex: currentIndex,
      totalPages: formState.pages.length,
      currentPageTitle: currentPage?.title || 'Untitled Page',
      onPreviousPage: navigateToPreviousPage,
      onNextPage: navigateToNextPage,
      onSubmit: () => console.log('Form submitted'),
      onAddPage: addNewPage,
      canGoBack: currentIndex > 0,
      canGoNext: currentIndex < formState.pages.length - 1,
      isLastPage: currentIndex === formState.pages.length - 1
    };
  }, [
    getCurrentPageIndex,
    formState.pages,
    navigateToPreviousPage,
    navigateToNextPage,
    addNewPage
  ]);

  return (
    <div className="form-builder-wrapper">{/* MobileDragDropManager removed in Phase 3 - mobile drag-drop now handled by SimpleCanvas */}
      <div className="form-builder optimized-form-builder">
        {/* Toolbar */}
        <div className="form-builder__toolbar">
          {toolbarActions.map((action) => (
            <button
              key={action.id}
              className={`toolbar-button ${action.variant || 'secondary'}`}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.title}
            >
              {action.icon}
            </button>
          ))}
        </div>

        {/* Wizard Navigation */}
        <FormWizardNavigation {...wizardProps} />

        {/* Main Content with Responsive Drawers */}
        <MobileDrawerManager
          leftPanelContent={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponentPalette onAddComponent={handleComponentAdd} />
            </Suspense>
          }
          rightPanelContent={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyPropertiesPanel
                selectedComponent={selectedComponent}
                onUpdateComponent={handleComponentUpdate}
              />
            </Suspense>
          }
        >
          <div className="form-builder__content">
            {/* Component Palette - Desktop */}
            <div className="form-builder__sidebar form-builder__sidebar--left">
              <Suspense fallback={<LoadingSpinner />}>
                <LazyComponentPalette onAddComponent={handleComponentAdd} />
              </Suspense>
            </div>

            {/* Canvas */}
            <div className="form-builder__main">
              <Suspense fallback={<LoadingSpinner />}>
                <LazyCanvas
                  components={currentComponents}
                  onDrop={handleDrop}
                  onSelect={handleComponentSelect}
                  onDelete={handleComponentDelete}
                  onMove={handleComponentMove}
                  onAddToLayout={handleLayoutAdd}
                  selectedId={selectedComponent?.id}
                />
              </Suspense>
              <DeleteZone onDelete={handleComponentDelete} />
            </div>

            {/* Properties Panel - Desktop */}
            <div className="form-builder__sidebar form-builder__sidebar--right">
              <Suspense fallback={<LoadingSpinner />}>
                <LazyPropertiesPanel
                  selectedComponent={selectedComponent}
                  onUpdateComponent={handleComponentUpdate}
                />
              </Suspense>
            </div>
          </div>
        </MobileDrawerManager>

        {/* Touch Drag Preview for Mobile - Removed in Phase 3, now handled by SimpleDraggableComponent */}
        {/* <TouchDragPreview /> */}

        {/* Preview Modal */}
        {showPreview && (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyPreviewModal
              isOpen={showPreview}
              onClose={onClosePreview || (() => {})}
              templateName={formState.templateName}
              pages={formState.pages.map(page => ({ ...page, order: 0 }))}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
});

OptimizedFormBuilder.displayName = 'OptimizedFormBuilder';

export { OptimizedFormBuilder };
