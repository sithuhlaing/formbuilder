/**
 * SmartDropZone Component - Handles drag-drop logic for individual canvas items
 * SOLID: Single Responsibility - Only handles drop zone logic
 */

import React, { useState, useRef, useCallback } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import type { SmartDropZoneProps, DragItem } from '../types';

export const SmartDropZone: React.FC<SmartDropZoneProps> = ({
  item,
  index,
  renderItem,
  onItemMove,
  onLayoutCreate,
  onItemDelete,
  onItemAdd,
  selectedItemId,
  config = {
    cssPrefix: 'canvas',
    enableHorizontalLayouts: true,
    enableVerticalLayouts: true,
    dropZoneThresholds: { horizontal: 0.25, vertical: 0.3 }
  }
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dropPosition, setDropPosition] = useState<string>('');

  const {
    cssPrefix,
    enableHorizontalLayouts,
    enableVerticalLayouts,
    dropZoneThresholds
  } = config;

  // Calculate drop position based on mouse coordinates
  const calculateDropPosition = useCallback((clientOffset: { x: number; y: number } | null) => {
    if (!ref.current || !clientOffset) return 'center';

    const rect = ref.current.getBoundingClientRect();
    const x = clientOffset.x - rect.left;
    const y = clientOffset.y - rect.top;
    const { width, height } = rect;

    // Horizontal zones (left/right) - configurable threshold
    if (enableHorizontalLayouts) {
      if (x < width * dropZoneThresholds.horizontal) return 'left';
      if (x > width * (1 - dropZoneThresholds.horizontal)) return 'right';
    }

    // Vertical zones for remaining middle area - configurable threshold
    if (enableVerticalLayouts) {
      if (y < height * dropZoneThresholds.vertical) return 'before';
      if (y > height * (1 - dropZoneThresholds.vertical)) return 'after';
    }

    return 'center';
  }, [enableHorizontalLayouts, enableVerticalLayouts, dropZoneThresholds]);

  // Drag functionality for existing items
  const [{ isDragging }, drag] = useDrag({
    type: 'existing-item',
    item: { 
      type: 'existing-item',
      id: item.id,
      index,
      item 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop functionality
  const [{ isOver }, drop] = useDrop({
    accept: ['new-item', 'existing-item'],
    hover: (dragItem: DragItem, monitor) => {
      const position = calculateDropPosition(monitor.getClientOffset());
      setDropPosition(position);
    },
    drop: (dragItem: DragItem, monitor) => {
      const position = calculateDropPosition(monitor.getClientOffset());
      
      if (dragItem.type === 'existing-item') {
        // Handle reordering existing items
        if (dragItem.index !== undefined && dragItem.index !== index) {
          onItemMove(dragItem.index, index);
        }
      } else if (dragItem.type === 'new-item' && dragItem.itemType) {
        // Handle new items from palette
        if (position === 'left' || position === 'right') {
          onLayoutCreate(dragItem.itemType, item.id, position);
        } else if (onItemAdd) {
          onItemAdd(dragItem.itemType, { type: position as any, targetId: item.id });
        }
      }
      
      setDropPosition('');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Combine drag and drop refs
  drag(drop(ref));

  const isSelected = selectedItemId === item.id;
  const isHover = isOver && dropPosition !== '';

  return (
    <div
      ref={ref}
      data-testid={`canvas-item-${index}`}
      data-component-id={item.id}
      data-component-type={item.type}
      className={`
        form-canvas__item 
        smart-drop-zone
        form-component
        ${isSelected ? 'form-component--selected is-selected' : ''}
        ${isDragging ? 'form-component--dragging is-dragging' : ''}
        ${isHover ? 'form-component--hover' : ''}
        ${isHover ? `hover-${dropPosition}` : ''}
        ${isHover ? 'is-drop-target' : ''}
      `.trim()}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* Drop position indicator */}
      {isHover && dropPosition && (
        <div className={`form-canvas__drop-indicator form-canvas__drop-indicator--${dropPosition}`}>
          <span className="drop-indicator">
            {dropPosition === 'left' ? '← Drop Left' : 
             dropPosition === 'right' ? 'Drop Right →' :
             dropPosition === 'before' ? '↑ Drop Before' :
             dropPosition === 'after' ? '↓ Drop After' : 
             'Drop Here'}
          </span>
        </div>
      )}

      {/* Hover Controls */}
      <div className="form-component__hover-controls">
        {/* Drag handle */}
        <div 
          className="form-component__hover-action form-component__hover-action--drag"
          style={{ cursor: 'grab' }}
        >
          ⋮⋮
        </div>

        {/* Delete button */}
        <button
          className="form-component__hover-action form-component__hover-action--delete"
          onClick={(e) => {
            e.stopPropagation();
            onItemDelete(item.id);
          }}
          aria-label="Delete item"
        >
          ×
        </button>
      </div>

      {/* Render item content using provided render function */}
      <div className="form-component__content">
        {renderItem(item, {
          isSelected,
          isDragging,
          isHover,
          cssPrefix
        })}
      </div>
    </div>
  );
};
