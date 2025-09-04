/**
 * Custom Drag Layer - Shows preview fields during drag operations
 */

import React from 'react';
import { useDragLayer } from 'react-dnd';
import { ComponentRenderer } from '../../core/ComponentRenderer';
import type { ComponentType, FormComponentData } from '../../types';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 1000,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(initialOffset: any, currentOffset: any) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const DragLayer: React.FC = () => {
  const {
    isDragging,
    item,
    initialOffset,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  function renderItem() {
    if (!item) return null;

    let componentType: ComponentType;
    
    if (item.type === 'new-item' && item.itemType) {
      // New item from palette
      componentType = item.itemType;
    } else if (item.type === 'existing-item' && item.item?.type) {
      // Existing item from canvas
      componentType = item.item.type;
    } else {
      return null;
    }

    // Create a mock component data for preview
    const mockComponent: FormComponentData = {
      id: 'drag-preview',
      type: componentType,
      label: ComponentRenderer.getComponentInfo(componentType).label,
      fieldId: 'preview-field',
      required: false,
      placeholder: 'Preview field...',
      children: []
    };

    return (
      <div className="drag-preview">
        <div className="drag-preview__container">
          <div className="drag-preview__field">
            {ComponentRenderer.renderComponent(mockComponent, 'preview')}
          </div>
          <div className="drag-preview__label">
            {ComponentRenderer.getComponentInfo(componentType).label}
          </div>
        </div>
      </div>
    );
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {renderItem()}
      </div>
    </div>
  );
};
