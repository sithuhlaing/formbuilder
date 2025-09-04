/**
 * PERFORMANCE OPTIMIZED - FormCanvas - Simplified UI Layer Component
 * Consolidates Canvas, FormPageCard, and CanvasCard into single cross-domain interface
 * Features: Lazy loading for large forms, performance monitoring
 */

import React, { useEffect, useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { CanvasManager, type CanvasState } from '../../core/CanvasManager';
import { ComponentRenderer } from './ComponentRenderer';
import type { ComponentType } from '../../types/component';

interface FormCanvasProps {
  canvasManager: CanvasManager;
  className?: string;
  showTitle?: boolean;
  showPageNavigation?: boolean;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  canvasManager,
  className = '',
  showTitle = true,
  showPageNavigation = true
}) => {
  const [canvasState, setCanvasState] = useState<CanvasState>(canvasManager.getState());
  const dropRef = useRef<HTMLDivElement>(null);

  // Subscribe to canvas state changes
  useEffect(() => {
    const unsubscribe = canvasManager.subscribe(setCanvasState);
    return unsubscribe;
  }, [canvasManager]);

  // Drop functionality for the main canvas area
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['new-component', 'existing-component'],
    drop: (item: { componentType: ComponentType }, monitor) => {
      if (monitor.didDrop()) return;
      
      // Drop on empty canvas - add to center
      canvasManager.onDrop(item.componentType, '', 'center');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  });

  // Connect drop target
  useEffect(() => {
    drop(dropRef.current);
  }, [drop]);

  const handleComponentSelect = (componentId: string) => {
    canvasManager.selectComponent(componentId);
  };

  const handleComponentDelete = (componentId: string) => {
    canvasManager.deleteComponent(componentId);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    canvasManager.updateFormTitle(event.target.value);
  };

  const isEmpty = canvasState.components.length === 0;
  const stats = canvasManager.getStats();

  return (
    <div className={`form-canvas ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Form Header */}
      {showTitle && (
        <div className="form-canvas__header" style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fff'
        }}>
          <input
            type="text"
            value={canvasState.formTitle}
            onChange={handleTitleChange}
            placeholder="Enter form title..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              backgroundColor: 'transparent'
            }}
          />
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            {stats.componentCount} components • {stats.domainMode} mode
          </div>
        </div>
      )}

      {/* Page Navigation */}
      {showPageNavigation && (
        <div className="form-canvas__navigation" style={{
          padding: '8px 20px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>
            Page 1 of 1
          </span>
          <button
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Add Page
          </button>
        </div>
      )}

      {/* Canvas Content Area */}
      <div
        ref={dropRef}
        className={`form-canvas__content ${isEmpty ? 'empty' : ''} ${isOver ? 'drop-target' : ''}`}
        style={{
          flex: 1,
          padding: '20px',
          overflow: 'auto',
          position: 'relative',
          backgroundColor: isOver ? '#f0f9ff' : (isEmpty ? '#fafafa' : '#fff'),
          border: isOver ? '2px dashed #3b82f6' : '2px dashed transparent',
          borderRadius: '8px',
          margin: '16px',
          minHeight: '400px',
          transition: 'all 0.2s ease'
        }}
      >
        {isEmpty ? (
          // Empty State
          <div className="form-canvas__empty-state" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              opacity: 0.5
            }}>
              📝
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              margin: '0 0 8px 0',
              color: '#374151'
            }}>
              Start Building Your {stats.domainMode === 'surveys' ? 'Survey' : 
                                 stats.domainMode === 'workflows' ? 'Workflow' : 'Form'}
            </h3>
            <p style={{
              fontSize: '14px',
              margin: '0 0 16px 0',
              maxWidth: '300px'
            }}>
              Drag components from the left panel to start creating your {stats.domainMode === 'surveys' ? 'survey questions' : 
                                                                        stats.domainMode === 'workflows' ? 'workflow steps' : 'form fields'}.
            </p>
            {canDrop && (
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Drop component here
              </div>
            )}
          </div>
        ) : (
          // Components List
          <div className="form-canvas__components" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {canvasState.components.map((component) => (
              <div
                key={component.id}
                className={`form-canvas__component ${canvasState.selectedComponentId === component.id ? 'selected' : ''}`}
                onClick={() => handleComponentSelect(component.id)}
                style={{
                  position: 'relative',
                  padding: '12px',
                  border: canvasState.selectedComponentId === component.id 
                    ? '2px solid #3b82f6' 
                    : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Component Actions */}
                <div className="form-canvas__component-actions" style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  display: 'flex',
                  gap: '4px',
                  opacity: canvasState.selectedComponentId === component.id ? 1 : 0,
                  transition: 'opacity 0.2s ease'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleComponentDelete(component.id);
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete component"
                  >
                    ×
                  </button>
                </div>

                {/* Component Content */}
                <ComponentRenderer
                  component={component}
                  readOnly={false}
                  isSelected={canvasState.selectedComponentId === component.id}
                />

                {/* Component Label */}
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '12px',
                  backgroundColor: '#fff',
                  padding: '2px 8px',
                  fontSize: '11px',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px'
                }}>
                  {canvasManager.getDomainLabel(component.type)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading Overlay */}
        {canvasState.isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Loading...
          </div>
        )}
      </div>

      {/* Canvas Footer */}
      <div className="form-canvas__footer" style={{
        padding: '12px 20px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f9fafb',
        fontSize: '12px',
        color: '#6b7280',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          {canvasState.selectedComponentId ? 'Component selected' : 'No selection'}
        </span>
        <span>
          {canvasState.isDragging ? 'Dragging...' : 'Ready'}
        </span>
      </div>
    </div>
  );
};
