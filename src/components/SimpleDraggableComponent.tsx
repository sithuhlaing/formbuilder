/**
 * SIMPLE DRAGGABLE COMPONENT - Phase 3 Implementation
 * Replaces: Complex drag item handling with position calculations
 * Total simplification: Direct drag handling without position complexity
 */

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Component } from '../types/components';
import { renderSimpleComponent } from './SimpleRenderer';

export interface SimpleDraggableComponentProps {
  component: Component;
  index: number;
  selected: boolean;
  mode: 'builder' | 'preview';
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

interface DragItem {
  type: string;
  id: string;
  index: number;
}

export function SimpleDraggableComponent({
  component,
  index,
  selected,
  mode,
  onSelect,
  onDelete,
  onMove
}: SimpleDraggableComponentProps) {

  // Simple drag handling for existing components
  const [{ isDragging }, drag] = useDrag({
    type: 'existing-component',
    item: { 
      type: 'existing-component', 
      id: component.id, 
      index, 
      component: component, // Pass full component for preview
      componentType: component.type 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    canDrag: mode === 'builder' // Only allow dragging in builder mode
  });

  // Simple drop handling for reordering
  const [{ isOver }, drop] = useDrop({
    accept: 'existing-component',
    drop: (item: DragItem) => {
      if (item.id !== component.id) {
        onMove(item.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    }),
    canDrop: (item: DragItem) => item.id !== component.id
  });

  // Combine drag and drop refs
  const dragDropRef = (node: HTMLDivElement | null) => {
    drag(node);
    drop(node);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas click
    if (mode === 'builder') {
      onSelect(selected ? null : component.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(component.id);
  };

  const componentClasses = [
    'simple-draggable-component',
    `component-${component.type}`,
    selected ? 'selected' : '',
    isDragging ? 'dragging' : '',
    isOver ? 'drop-target' : '',
    mode === 'preview' ? 'preview-mode' : 'builder-mode'
  ].filter(Boolean).join(' ');

  const componentStyle: React.CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    cursor: mode === 'builder' ? (isDragging ? 'grabbing' : 'grab') : 'default',
    position: 'relative',
    padding: mode === 'builder' ? '0.5rem' : '0',
    margin: mode === 'builder' ? '0.25rem 0' : '0',
    border: selected ? '2px solid #007bff' : mode === 'builder' ? '1px solid transparent' : 'none',
    borderRadius: '4px',
    backgroundColor: selected ? '#f8f9fa' : 'transparent',
    transition: 'all 0.2s ease',
    transform: isDragging ? 'rotate(2deg)' : 'none',
    // Drop target styling
    ...(isOver && mode === 'builder' && {
      borderTop: '3px solid #007bff',
      marginTop: '1rem'
    })
  };

  return (
    <div
      ref={mode === 'builder' ? dragDropRef : undefined}
      className={componentClasses}
      style={componentStyle}
      onClick={handleClick}
    >
      {/* Component content */}
      <div className="component-content">
        {renderSimpleComponent(component)}
      </div>

      {/* Builder mode controls */}
      {mode === 'builder' && (
        <>
          {/* Selection overlay */}
          {selected && (
            <div
              className="selection-overlay"
              style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                border: '2px solid #007bff',
                borderRadius: '4px',
                pointerEvents: 'none',
                backgroundColor: 'rgba(0, 123, 255, 0.1)'
              }}
            />
          )}

          {/* Component controls */}
          <div
            className="component-controls"
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              display: selected ? 'flex' : 'none',
              gap: '4px',
              zIndex: 10
            }}
          >
            {/* Component type badge */}
            <span
              className="component-type-badge"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                letterSpacing: '0.5px'
              }}
            >
              {component.type.replace('_', ' ')}
            </span>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="delete-button"
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              title="Delete component"
            >
              ×
            </button>
          </div>

          {/* Drag handle indicator */}
          <div
            className="drag-handle"
            style={{
              position: 'absolute',
              left: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '4px',
              height: '20px',
              background: 'repeating-linear-gradient(to bottom, #ccc 0px, #ccc 2px, transparent 2px, transparent 4px)',
              opacity: selected ? 1 : 0.3,
              borderRadius: '2px'
            }}
          />

          {/* Drop indicator */}
          {isOver && (
            <div
              style={{
                position: 'absolute',
                top: '-4px',
                left: '0',
                right: '0',
                height: '4px',
                backgroundColor: '#007bff',
                borderRadius: '2px',
                zIndex: 5
              }}
            />
          )}
        </>
      )}

      {/* Required indicator */}
      {component.required && (
        <span
          className="required-indicator"
          style={{
            position: 'absolute',
            top: mode === 'builder' ? '2px' : '0',
            left: mode === 'builder' ? '2px' : '0',
            color: '#dc3545',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          *
        </span>
      )}
    </div>
  );
}

// CSS styles (would normally be in a separate CSS file)
export const SIMPLE_DRAGGABLE_COMPONENT_STYLES = `
.simple-draggable-component {
  position: relative;
  box-sizing: border-box;
}

.simple-draggable-component.builder-mode:hover {
  border-color: #007bff !important;
}

.simple-draggable-component.selected {
  z-index: 2;
}

.simple-draggable-component.dragging {
  z-index: 1000;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
}

.simple-draggable-component.preview-mode {
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}

.component-content {
  position: relative;
  z-index: 1;
}

.component-controls {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.delete-button:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0,0,0,0.3) !important;
}

.drag-handle {
  transition: opacity 0.2s ease;
}

.simple-draggable-component:hover .drag-handle {
  opacity: 0.6 !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .simple-draggable-component.builder-mode {
    padding: 0.75rem !important;
  }
  
  .component-controls {
    top: -12px !important;
    right: -12px !important;
  }
  
  .delete-button {
    width: 24px !important;
    height: 24px !important;
    font-size: 14px !important;
  }
}

/* Animation for drop targets */
.simple-draggable-component.drop-target {
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { border-top-color: #007bff; }
  to { border-top-color: #0056b3; }
}
`;