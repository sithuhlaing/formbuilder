/**
 * SIMPLE CANVAS COMPONENT - Phase 3 Implementation
 * Replaces: DragDropCanvas + SmartDropZone + FormCanvasAdapter (6 components → 1)
 * Total replacement: ~800 lines → ~100 lines (87% reduction)
 */

import React, { useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import type { Component, ComponentType, DragItem } from '../types/components';
import { SimpleDraggableComponent } from './SimpleDraggableComponent';
import { renderSimpleComponent } from './SimpleRenderer';
import { createComponent } from '../core/componentUtils';

export interface SimpleCanvasProps {
  // Core data
  components: Component[];
  selectedId: string | null;
  
  // Event handlers
  onDrop: (componentType: ComponentType, position?: { index: number }) => void;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  
  // Display options
  mode?: 'builder' | 'preview';
  className?: string;
  emptyMessage?: string;
}

export function SimpleCanvas({
  components,
  selectedId,
  onDrop,
  onSelect,
  onDelete,
  onMove,
  mode = 'builder',
  className = '',
  emptyMessage = 'Drag components here to start building your form'
}: SimpleCanvasProps) {
  // State to track current drop position for visual feedback
  const [dropPosition, setDropPosition] = useState<number | null>(null);

  // Calculate drop position based on mouse position
  const calculateDropPosition = (monitor: any, canvasElement: HTMLElement): number => {
    if (components.length === 0) {
      return 0;
    }

    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) {
      return components.length;
    }

    const canvasRect = canvasElement.getBoundingClientRect();
    const mouseY = clientOffset.y - canvasRect.top;

    // Find component elements and their positions
    const componentElements = canvasElement.querySelectorAll('[data-component-index]');

    for (let i = 0; i < componentElements.length; i++) {
      const element = componentElements[i] as HTMLElement;
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top - canvasRect.top;
      const elementMiddle = elementTop + (elementRect.height / 2);

      // If mouse is above the middle of this component, insert before it
      if (mouseY < elementMiddle) {
        return i;
      }
    }

    // If we get here, insert at the end
    return components.length;
  };

  // Simple drop handling - replaces complex drop zone logic
  const [{ isOver, canDrop, dragItem }, drop] = useDrop({
    accept: ['component-type', 'existing-component'],
    drop: (item: DragItem, monitor) => {
      // Only handle drops directly on canvas (not nested drops)
      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      if (item.type || item.componentType) {
        // Calculate where to insert the component based on drop position
        const canvasElement = drop.current;
        const insertIndex = canvasElement ? calculateDropPosition(monitor, canvasElement) : components.length;

        // Dropping new component from palette
        onDrop(item.type || item.componentType, { index: insertIndex });
      }

      // Clear drop position after drop
      setDropPosition(null);
      // Note: Moving existing components will be handled by SimpleDraggableComponent
    },
    hover: (item: DragItem, monitor) => {
      // Only track hover for new components from palette
      if (item.type === 'component-type' && monitor.isOver({ shallow: true })) {
        const canvasElement = drop.current;
        if (canvasElement) {
          const newDropPosition = calculateDropPosition(monitor, canvasElement);
          setDropPosition(newDropPosition);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      dragItem: monitor.getItem() as DragItem
    })
  });

  const canvasClasses = [
    'simple-canvas',
    mode === 'preview' ? 'simple-canvas--preview' : 'simple-canvas--builder',
    isOver && canDrop ? 'simple-canvas--drag-over' : '',
    className
  ].filter(Boolean).join(' ');

  // Create preview component for palette drags
  const previewComponent = dragItem?.type === 'component-type' && isOver && canDrop
    ? createComponent(dragItem.componentType || dragItem.type)
    : null;

  // Determine drag type for visual feedback
  const dragType = dragItem?.type === 'component-type' ? 'palette' : 
                   dragItem?.type === 'existing-component' ? 'reorder' : null;

  return (
    <div 
      ref={drop}
      className={canvasClasses}
      data-drag-type={dragType}
      onClick={() => mode === 'builder' && onSelect(null)} // Clear selection when clicking canvas
      style={{
        minHeight: '400px',
        padding: '1rem',
        border: isOver && canDrop ? '2px dashed #007bff' : '2px dashed #dee2e6',
        borderRadius: '8px',
        backgroundColor: isOver && canDrop ? '#f8f9fa' : 'transparent',
        position: 'relative',
        transition: 'border-color 0.2s, background-color 0.2s'
      }}
    >
      {components.length === 0 ? (
        // Empty state
        <div className="simple-canvas__empty" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '200px',
          color: '#6c757d',
          fontSize: '1.1rem',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div>
            <div style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>📋</div>
            <div>{emptyMessage}</div>
            {mode === 'builder' && (
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Choose from the component palette on the left
              </div>
            )}
          </div>
        </div>
      ) : (
        // Render components
        <div className="simple-canvas__content">
          {/* Drop indicator at the beginning if needed */}
          {dragItem?.type === 'component-type' && dropPosition === 0 && (
            <div
              className="drop-indicator"
              style={{
                height: '3px',
                backgroundColor: '#007bff',
                borderRadius: '2px',
                margin: '8px 0',
                opacity: 0.9,
                animation: 'pulse 1s ease-in-out infinite alternate',
                transition: 'all 0.2s ease'
              }}
            />
          )}

          {components.map((component, index) => (
            <React.Fragment key={component.id}>
              <SimpleDraggableComponent
                component={component}
                index={index}
                selected={component.id === selectedId}
                mode={mode}
                onSelect={onSelect}
                onDelete={onDelete}
                onMove={onMove}
              />

              {/* Drop indicator after this component if drop position matches */}
              {dragItem?.type === 'component-type' && dropPosition === index + 1 && (
                <div
                  className="drop-indicator"
                  style={{
                    height: '3px',
                    backgroundColor: '#007bff',
                    borderRadius: '2px',
                    margin: '8px 0',
                    opacity: 0.9,
                    animation: 'pulse 1s ease-in-out infinite alternate',
                    transition: 'all 0.2s ease'
                  }}
                />
              )}
            </React.Fragment>
          ))}
          
          {/* Inline preview for palette drag */}
          {previewComponent && (
            <div 
              className="drag-preview-component"
              style={{
                opacity: 0.6,
                border: '2px dashed #007bff',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                padding: '0.5rem',
                margin: '0.25rem 0',
                position: 'relative',
                animation: 'pulse 1s ease-in-out infinite alternate'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: '-8px', 
                left: '8px', 
                backgroundColor: '#007bff',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                PREVIEW
              </div>
              {renderSimpleComponent(previewComponent)}
            </div>
          )}
        </div>
      )}
      
      {/* Visual feedback for drag operations - only show for reorder, not palette */}
      {isOver && canDrop && dragType === 'reorder' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(40, 167, 69, 0.05)',
          border: '2px dashed #28a745',
          borderRadius: '8px',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          color: '#28a745',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ↕️ Move component here
        </div>
      )}
    </div>
  );
}

// CSS styles (would normally be in a separate CSS file)
export const SIMPLE_CANVAS_STYLES = `
.simple-canvas {
  width: 100%;
  box-sizing: border-box;
}

.simple-canvas--builder {
  cursor: default;
}

.simple-canvas--preview {
  border: none !important;
  padding: 0;
}

.simple-canvas--drag-over {
  background-color: #f8f9fa;
}

.simple-canvas__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.simple-canvas__empty {
  user-select: none;
}

/* Responsive design */
@media (max-width: 768px) {
  .simple-canvas {
    min-height: 300px;
    padding: 0.5rem;
  }
  
  .simple-canvas__empty {
    min-height: 150px;
    font-size: 1rem;
  }
}
`;

// Component type for drag items from palette
export const PALETTE_DRAG_TYPE = 'component-type';
export const EXISTING_COMPONENT_DRAG_TYPE = 'existing-component';