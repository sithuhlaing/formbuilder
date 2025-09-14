/**
 * SIMPLE FORM BUILDER - Phase 5 Integration
 * Replaces: OptimizedFormBuilder.tsx (complex system)
 * Uses: All simplified systems from Phases 1-4
 */

import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SimpleCanvas } from './SimpleCanvas';
import { SimpleComponentPalette } from './SimpleComponentPalette';
import type { ComponentType } from '../types/components';
import type { FormPage } from '../hooks/useSimpleFormBuilder';

interface SimpleFormBuilderProps {
  formBuilderHook: ReturnType<typeof import('../hooks/useSimpleFormBuilder').useSimpleFormBuilder>;
  showPreview?: boolean;
  onClosePreview?: () => void;
}

// Draggable Page Item Component
interface DraggablePageItemProps {
  page: FormPage;
  index: number;
  isActive: boolean;
  onPageClick: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onMoveUp: (pageId: string) => void;
  onMoveDown: (pageId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const DraggablePageItem: React.FC<DraggablePageItemProps> = ({
  page,
  index,
  isActive,
  onPageClick,
  onDeletePage,
  onMoveUp,
  onMoveDown,
  onReorder,
  canMoveUp,
  canMoveDown
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'page',
    item: { index, id: page.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'page',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover(item: { index: number; id: string }, monitor) {
      if (!monitor.isOver({ shallow: true })) return;
      
      if (item.index !== index) {
        onReorder(item.index, index);
        item.index = index;
      }
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' && canMoveUp) {
      e.preventDefault();
      onMoveUp(page.id);
    } else if (e.key === 'ArrowDown' && canMoveDown) {
      e.preventDefault();
      onMoveDown(page.id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPageClick(page.id);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      onDeletePage(page.id);
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`page-item ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-over' : ''}`}
      onClick={() => onPageClick(page.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Page ${page.title}, ${page.components.length} components`}
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="page-drag-handle">⋮⋮</div>
      
      <div className="page-info">
        <span className="page-title">{page.title}</span>
        <span className="page-component-count">({page.components.length} components)</span>
      </div>
      
      <div className="page-actions">
        <button 
          className={`btn-icon ${canMoveUp ? '' : 'disabled'}`}
          title="Move Up"
          onClick={(e) => {
            e.stopPropagation();
            if (canMoveUp) onMoveUp(page.id);
          }}
          disabled={!canMoveUp}
        >
          ↑
        </button>
        <button 
          className={`btn-icon ${canMoveDown ? '' : 'disabled'}`}
          title="Move Down"
          onClick={(e) => {
            e.stopPropagation();
            if (canMoveDown) onMoveDown(page.id);
          }}
          disabled={!canMoveDown}
        >
          ↓
        </button>
        <button 
          className="btn-icon btn-danger" 
          title="Delete Page"
          onClick={(e) => {
            e.stopPropagation();
            onDeletePage(page.id);
          }}
        >
          ✖
        </button>
      </div>
    </div>
  );
};


export const SimpleFormBuilder: React.FC<SimpleFormBuilderProps> = ({
  formBuilderHook,
  showPreview: _showPreview,
  onClosePreview: _onClosePreview
}) => {
  const {
    components,
    selectedId,
    addComponent,
    deleteComponent,
    selectComponent,
    moveComponent,
    clearAll,
    pages,
    currentPageId,
    addPage,
    deletePage,
    switchToPage,
    reorderPages,
    movePageUp,
    movePageDown
  } = formBuilderHook;

  const handleDrop = (type: ComponentType, position?: { index: number }) => {
    addComponent(type, position?.index);
  };

  const handleAddNewPage = () => {
    addPage();
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      alert('Cannot delete the last page.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      deletePage(pageId);
    }
  };

  const handlePageClick = (pageId: string) => {
    switchToPage(pageId);
  };

  const getCurrentPageIndex = () => {
    return pages.findIndex(page => page.id === currentPageId);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="simple-form-builder">
        {/* Page Management Card */}
        <div className="page-management">
          <div className="page-management-container">
            <div className="page-header">
              <h3>Pages ({pages.length})</h3>
              <button onClick={handleAddNewPage} className="add-page-btn">
                + Add Page
              </button>
            </div>
            
            <div className="page-list">
              {pages.map((page, index) => (
                <DraggablePageItem
                  key={page.id}
                  page={page}
                  index={index}
                  isActive={index === getCurrentPageIndex()}
                  onPageClick={handlePageClick}
                  onDeletePage={handleDeletePage}
                  onMoveUp={movePageUp}
                  onMoveDown={movePageDown}
                  onReorder={reorderPages}
                  canMoveUp={index > 0}
                  canMoveDown={index < pages.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main form builder layout */}
        <div className="form-builder-layout">
          {/* Component Palette - Left Side */}
          <div className="form-builder-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">Components</h3>
              <SimpleComponentPalette
                onAddComponent={addComponent}
                className="component-palette"
              />
            </div>
          </div>

          {/* Canvas - Center */}
          <div className="form-builder-main">
            <div className="canvas-section">
              <SimpleCanvas
                components={components}
                selectedId={selectedId}
                onDrop={handleDrop}
                onSelect={selectComponent}
                onDelete={deleteComponent}
                onMove={moveComponent}
                mode="builder"
              />
            </div>
          </div>

          {/* Properties Panel - Right Side */}
          <div className="form-builder-properties">
            <div className="properties-section">
              <h3 className="properties-title">Properties</h3>
              {selectedId ? (
                <div className="selected-component-properties">
                  <p className="selected-info">
                    Selected: {components.find(c => c.id === selectedId)?.label || 'Component'}
                  </p>
                  <p className="help-text">
                    Properties panel coming soon - component is selected and ready for editing.
                  </p>
                </div>
              ) : (
                <div className="no-selection">
                  <p className="help-text">
                    Select a component to edit its properties
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats/Info Bar */}
        <div className="form-builder-footer">
          <div className="form-stats">
            <span className="stat">
              📊 Components: {components.length}
            </span>
            <span className="stat">
              {selectedId ? `Selected: ${components.find(c => c.id === selectedId)?.type || 'Unknown'}` : 'No selection'}
            </span>
            <span className="stat">
              🎯 Simple System Active
            </span>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

// CSS Styles for the Simple Form Builder
export const SIMPLE_FORM_BUILDER_STYLES = `
.simple-form-builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
}

/* Page Management - Clean & Minimal */
.page-management {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

.page-management-container {
  max-width: 600px;
  width: 100%;
  margin: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.add-page-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-page-btn:hover {
  background: #2563eb;
}

.page-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.page-list::-webkit-scrollbar {
  width: 4px;
}

.page-list::-webkit-scrollbar-track {
  background: transparent;
}

.page-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.page-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.page-item.dragging {
  cursor: grabbing;
  opacity: 0.7;
  z-index: 1000;
}

.page-item.drop-over {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.page-drag-handle {
  color: #9ca3af;
  cursor: grab;
  user-select: none;
  transition: color 0.2s;
}

.page-item:hover .page-drag-handle {
  color: #6b7280;
}

.page-info {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.page-item.active .page-title {
  color: #3b82f6;
  font-weight: 600;
}

.page-component-count {
  font-size: 12px;
  color: #9ca3af;
}

.page-item.active .page-component-count {
  color: #6366f1;
}

.page-actions {
  display: flex;
  gap: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.page-item:hover .page-actions {
  opacity: 1;
}

.btn-icon {
  padding: 4px;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.btn-icon:hover:not(.disabled) {
  background: #e5e7eb;
  color: #374151;
}

.btn-icon.btn-danger {
  background: #fef2f2;
  color: #ef4444;
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.btn-icon.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-management-container {
    max-width: none;
    margin: 0 16px;
  }
  
  .page-list {
    max-height: 160px;
    padding: 10px;
  }
  
  .page-item {
    padding: 10px;
    min-height: 40px;
  }
}

@media (max-width: 480px) {
  .page-management {
    padding: 16px 0;
  }
  
  .page-header {
    margin-bottom: 12px;
  }
  
  .page-header h3 {
    font-size: 16px;
  }
  
  .add-page-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}

.form-builder-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.form-builder-sidebar {
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #dee2e6;
  overflow-y: auto;
}

.sidebar-section {
  padding: 1rem;
}

.sidebar-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
}

.form-builder-main {
  flex: 1;
  overflow: auto;
  background-color: #f8f9fa;
}

.canvas-section {
  height: 100%;
  padding: 1rem;
}

.form-builder-properties {
  width: 250px;
  background-color: #fff;
  border-left: 1px solid #dee2e6;
  overflow-y: auto;
}

.properties-section {
  padding: 1rem;
}

.properties-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
}

.selected-component-properties {
  padding: 1rem;
  background-color: #e7f3ff;
  border-radius: 4px;
  border: 1px solid #b3d9ff;
}

.selected-info {
  font-weight: 600;
  color: #0066cc;
  margin: 0 0 0.5rem 0;
}

.no-selection {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.help-text {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

.form-builder-footer {
  background-color: #fff;
  border-top: 1px solid #dee2e6;
  padding: 0.5rem 2rem;
}

.form-stats {
  display: flex;
  gap: 2rem;
  font-size: 0.875rem;
}

.stat {
  color: #6c757d;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* Responsive design */
@media (max-width: 1200px) {
  .form-builder-properties {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .form-builder-layout {
    flex-direction: column;
  }
  
  .form-builder-sidebar,
  .form-builder-properties {
    width: 100%;
    height: auto;
    max-height: 300px;
  }
  
  .form-builder-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-stats {
    justify-content: center;
  }
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;