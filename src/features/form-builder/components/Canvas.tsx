/**
 * Clean Canvas Component - Form Builder Feature
 * Single purpose: Render the drag-drop canvas
 */

import React from 'react';
import { useDrop } from 'react-dnd';
import { ComponentRenderer } from '../../../core';
import type { FormComponentData, ComponentType } from '../../../types';

interface CanvasItemProps {
  component: FormComponentData;
  onDrop: (componentType: ComponentType, targetId: string, position: 'before' | 'after') => void;
  onSelect: (componentId: string) => void;
  selectedId?: string;
}

const CanvasItem: React.FC<CanvasItemProps> = ({ component, onDrop, onSelect, selectedId }) => {
  const [{ isOver: isOverBefore }, dropBefore] = useDrop({
    accept: 'component',
    drop: (item: { type: ComponentType }) => {
      onDrop(item.type, component.id, 'before');
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isOver: isOverAfter }, dropAfter] = useDrop({
    accept: 'component',
    drop: (item: { type: ComponentType }) => {
      onDrop(item.type, component.id, 'after');
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div className="canvas-item-wrapper">
      {/* Drop zone before component */}
      <div
        ref={dropBefore}
        className={`canvas-item__drop-zone canvas-item__drop-zone--before ${
          isOverBefore ? 'canvas-item__drop-zone--active' : ''
        }`}
      >
        {isOverBefore && <div className="drop-indicator">Drop here</div>}
      </div>
      
      {/* The actual component */}
      <div
        className={`canvas-item ${selectedId === component.id ? 'canvas-item--selected' : ''}`}
        onClick={() => onSelect(component.id)}
        dangerouslySetInnerHTML={{
          __html: ComponentRenderer.renderComponent(component, 'builder')
        }}
      />
      
      {/* Drop zone after component */}
      <div
        ref={dropAfter}
        className={`canvas-item__drop-zone canvas-item__drop-zone--after ${
          isOverAfter ? 'canvas-item__drop-zone--active' : ''
        }`}
      >
        {isOverAfter && <div className="drop-indicator">Drop here</div>}
      </div>
    </div>
  );
};

interface CanvasProps {
  components: FormComponentData[];
  onDrop: (componentType: ComponentType, targetId: string, position: 'before' | 'after') => void;
  onSelect: (componentId: string) => void;
  selectedId?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  components, 
  onDrop, 
  onSelect, 
  selectedId 
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: { type: ComponentType }, monitor) => {
      // Check if drop was handled by a child component
      if (monitor.didDrop()) {
        return;
      }
      
      // Handle drop at end of canvas OR empty canvas
      if (components.length > 0) {
        onDrop(item.type, components[components.length - 1].id, 'after');
      } else {
        // For empty canvas, create first component
        onDrop(item.type, 'empty-canvas', 'after');
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop}
      className={`canvas ${isOver ? 'canvas--drop-hover' : ''}`}
    >
      {components.length === 0 ? (
        <div className="canvas__empty">
          <p>Drag components here to start building your form</p>
        </div>
      ) : (
        <div className="canvas__content">
          {components.map((component) => (
            <CanvasItem
              key={component.id}
              component={component}
              onDrop={onDrop}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};