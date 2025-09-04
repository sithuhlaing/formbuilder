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
  onAddToLayout,
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

  // Apply row layout drag-drop constraints based on business rules
  const applyRowLayoutConstraints = useCallback((position: string, dragItem: DragItem, targetItem: any) => {
    // Rule 1: Row Layout as Single Unit - Row layouts can only be dragged vertically
    if (dragItem.dragType === 'row-layout') {
      // Row layouts can only be positioned before/after (vertically)
      if (position === 'left' || position === 'right') {
        return 'center'; // Convert horizontal to center drop
      }
      return position; // Allow before/after/center
    }

    // Rule 2: Internal Row Arrangement - Inside row layouts, only left-right allowed
    if (targetItem.type === 'horizontal_layout') {
      // Within row layouts, only horizontal positioning allowed
      if (position === 'before' || position === 'after') {
        return 'right'; // Convert vertical to horizontal positioning
      }
      return position; // Allow left/right/center
    }

    // Rule 3: No Nested Row Layouts - Prevent row layouts inside row layouts
    if (dragItem.item?.type === 'horizontal_layout' && targetItem.type === 'horizontal_layout') {
      // Prevent dropping row layout into another row layout
      return 'center'; // Convert to safe center drop
    }

    // Rule 4: Root Level Container Behavior - Normal positioning for individual components
    return position;
  }, []);

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

  // Drop functionality with row layout constraints
  const [{ isOver }, drop] = useDrop({
    accept: ['new-item', 'existing-item'],
    hover: (dragItem: DragItem, monitor) => {
      const position = calculateDropPosition(monitor.getClientOffset());
      
      // Apply row layout constraints
      const constrainedPosition = applyRowLayoutConstraints(position, dragItem, item);
      setDropPosition(constrainedPosition);
    },
    drop: (dragItem: DragItem, monitor) => {
      // Prevent event bubbling to parent drop zones
      if (monitor.didDrop()) return;
      
      const position = calculateDropPosition(monitor.getClientOffset());
      const constrainedPosition = applyRowLayoutConstraints(position, dragItem, item);
      console.log('SmartDropZone drop:', { dragItem, position: constrainedPosition, targetId: item.id });
      
      if (dragItem.type === 'existing-item') {
        // Handle existing items - create horizontal layout for left/right drops
        if (constrainedPosition === 'left' || constrainedPosition === 'right') {
          // Check if target is already a horizontal layout
          if (item.type === 'horizontal_layout' && onAddToLayout && dragItem.item) {
            console.log('Adding existing item to horizontal layout:', dragItem.item.type, item.id);
            onAddToLayout(dragItem.item.type, item.id);
          } else if (onLayoutCreate && dragItem.item && item.type !== 'horizontal_layout') {
            // Only create horizontal layout if target is NOT already a horizontal layout
            console.log('Creating horizontal layout for existing item:', dragItem.item.type, item.id, constrainedPosition);
            onLayoutCreate(dragItem.item.type, item.id, constrainedPosition);
          }
        } else if (dragItem.index !== undefined && dragItem.index !== index) {
          // Regular reordering for before/after/center drops
          onItemMove(dragItem.index, index);
        }
      } else if (dragItem.type === 'new-item' && dragItem.itemType) {
        // Handle new items from palette
        if (constrainedPosition === 'left' || constrainedPosition === 'right') {
          // Check if target is already a horizontal layout
          if (item.type === 'horizontal_layout' && onAddToLayout) {
            console.log('Adding new item to horizontal layout:', dragItem.itemType, item.id);
            onAddToLayout(dragItem.itemType, item.id);
          } else if (item.type !== 'horizontal_layout') {
            // Only create horizontal layout if target is NOT already a horizontal layout
            console.log('Creating horizontal layout for new item:', dragItem.itemType, item.id, constrainedPosition);
            onLayoutCreate(dragItem.itemType, item.id, constrainedPosition);
          }
        } else if (onItemAdd) {
          onItemAdd(dragItem.itemType, { type: constrainedPosition as any, targetId: item.id });
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
