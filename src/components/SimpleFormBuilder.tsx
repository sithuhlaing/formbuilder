/**
 * SIMPLE FORM BUILDER - Phase 5 Integration
 * Replaces: OptimizedFormBuilder.tsx (complex system)
 * Uses: All simplified systems from Phases 1-4
 */

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SimpleCanvas } from './SimpleCanvas';
import { SimpleComponentPalette } from './SimpleComponentPalette';
import type { ComponentType } from '../types/components';

interface SimpleFormBuilderProps {
  formBuilderHook: ReturnType<typeof import('../hooks/useSimpleFormBuilder').useSimpleFormBuilder>;
  onSave?: () => void;
  onExport?: () => void;
  onPreview?: () => void;
  showPreview?: boolean;
  onClosePreview?: () => void;
}


export const SimpleFormBuilder: React.FC<SimpleFormBuilderProps> = ({
  formBuilderHook,
  onSave,
  onExport,
  onPreview,
  showPreview: _showPreview,
  onClosePreview: _onClosePreview
}) => {
  const {
    templateName,
    components,
    selectedId,
    addComponent,
    deleteComponent,
    selectComponent,
    moveComponent,
    setTemplateName
  } = formBuilderHook;

  const handleDrop = (type: ComponentType, position?: { index: number }) => {
    addComponent(type, position?.index);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateName(event.target.value);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="simple-form-builder">
        {/* Header with template title and actions */}
        <div className="form-builder-header">
          <div className="form-title-section">
            <input
              type="text"
              value={templateName}
              onChange={handleTitleChange}
              placeholder="Form Title"
              className="form-title-input"
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                border: '1px solid transparent',
                borderRadius: '4px',
                padding: '0.5rem',
                backgroundColor: '#f8f9fa',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#007bff';
                e.target.style.backgroundColor = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent';
                e.target.style.backgroundColor = '#f8f9fa';
              }}
            />
          </div>
          
          <div className="form-builder-actions">
            {onPreview && (
              <button
                onClick={onPreview}
                className="btn btn-secondary"
                style={{ marginRight: '0.5rem' }}
              >
                👁️ Preview
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="btn btn-secondary"
                style={{ marginRight: '0.5rem' }}
              >
                📤 Export
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                className="btn btn-primary"
              >
                💾 Save
              </button>
            )}
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

.form-builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  border-bottom: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-title-section {
  flex: 1;
}

.form-title-input:hover {
  border-color: #6c757d !important;
  background-color: #fff !important;
}

.form-builder-actions {
  display: flex;
  gap: 0.5rem;
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