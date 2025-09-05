/**
 * SIMPLE CANVAS COMPONENT - Phase 3 Implementation
 * Replaces: DragDropCanvas + SmartDropZone + FormCanvasAdapter (6 components → 1)
 * Total replacement: ~800 lines → ~100 lines (87% reduction)
 */

import React from 'react';
import { useDrop } from 'react-dnd';
import type { Component, ComponentType, DragItem } from '../types/components';
import { SimpleDraggableComponent } from './SimpleDraggableComponent';
import { renderSimpleComponent } from './SimpleRenderer';

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
  
  // Simple drop handling - replaces complex drop zone logic
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['component-type', 'existing-component'],
    drop: (item: DragItem, monitor) => {
      // Only handle drops directly on canvas (not nested drops)
      if (!monitor.isOver({ shallow: true })) {
        return;
      }
      
      if (item.type) {
        // Dropping new component from palette
        onDrop(item.type, { index: components.length });
      }
      // Note: Moving existing components will be handled by SimpleDraggableComponent
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  });

  const canvasClasses = [
    'simple-canvas',
    mode === 'preview' ? 'simple-canvas--preview' : 'simple-canvas--builder',
    isOver && canDrop ? 'simple-canvas--drag-over' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={drop}
      className={canvasClasses}
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
          {components.map((component, index) => (
            <SimpleDraggableComponent
              key={component.id}
              component={component}
              index={index}
              selected={component.id === selectedId}
              mode={mode}
              onSelect={onSelect}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </div>
      )}
      
      {/* Visual feedback for drag operations */}
      {isOver && canDrop && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          border: '2px dashed #007bff',
          borderRadius: '8px',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          color: '#007bff',
          fontWeight: 'bold'
        }}>
          Drop component here
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