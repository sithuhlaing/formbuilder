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

  // Enhanced position calculation with intelligent layout detection
  const calculateDropPosition = useCallback((clientOffset: { x: number; y: number } | null) => {
    if (!ref.current || !clientOffset) return 'center';

    const rect = ref.current.getBoundingClientRect();
    const x = clientOffset.x - rect.left;
    const y = clientOffset.y - rect.top;
    const { width, height } = rect;

    // Enhanced zone detection with priority system
    // Priority 1: Vertical zones (top/bottom) - always available for column layout
    if (enableVerticalLayouts) {
      if (y < height * dropZoneThresholds.vertical) return 'top';
      if (y > height * (1 - dropZoneThresholds.vertical)) return 'bottom';
    }

    // Priority 2: Horizontal zones (left/right) - for row layout creation/extension
    if (enableHorizontalLayouts) {
      if (x < width * dropZoneThresholds.horizontal) return 'left';
      if (x > width * (1 - dropZoneThresholds.horizontal)) return 'right';
    }

    // Priority 3: Center zone for direct replacement/insertion
    return 'center';
  }, [enableHorizontalLayouts, enableVerticalLayouts, dropZoneThresholds]);

  // Detect if target or siblings are row layout containers
  const detectRowLayoutContext = useCallback(() => {
    // Check if current item is a row layout
    const isCurrentRowLayout = item.type === 'horizontal_layout';
    
    // Check if parent container has row layouts
    // Note: This requires sibling context which would need to be passed as props
    // For now, we'll use a simple heuristic based on the current index and item type
    const hasRowLayoutSiblings = false; // Will be true when parent context is available
    
    return {
      isCurrentRowLayout,
      hasRowLayoutSiblings,
      canFormRowLayout: !isCurrentRowLayout,
      canExtendRowLayout: isCurrentRowLayout
    };
  }, [item.type]);

  // Enhanced layout constraints with intelligent row layout handling
  const applyEnhancedLayoutConstraints = useCallback((position: string, dragItem: DragItem, targetItem: any) => {
    const layoutContext = detectRowLayoutContext();
    
    // ENHANCED RULE 1: Vertical Layout Priority (Top/Bottom zones)
    if (position === 'top' || position === 'bottom') {
      // Always allow vertical positioning for column layout
      return position;
    }
    
    // ENHANCED RULE 2: Horizontal Layout Intelligence (Left/Right zones)
    if (position === 'left' || position === 'right') {
      if (layoutContext.isCurrentRowLayout) {
        // Target IS a row layout container - add as member
        return position; // Add to existing row layout
      } else {
        // Target is regular element - form new row layout
        return `form-row-${position}`; // Signal to create new row layout
      }
    }
    
    // ENHANCED RULE 3: Within Row Layout Constraints
    if (targetItem.type === 'horizontal_layout') {
      // Inside row layout: only left/right/center allowed
      if (position === 'top' || position === 'bottom') {
        // Convert vertical to horizontal within row layout
        return 'right'; // Default to right side
      }
      return position; // Allow left/right/center
    }
    
    // ENHANCED RULE 4: Row Layout Dragging Constraints
    if (dragItem.dragType === 'row-layout') {
      // Row layouts can only move vertically (top/bottom)
      if (position === 'left' || position === 'right') {
        return 'center'; // Prevent horizontal row layout movement
      }
      return position;
    }
    
    // ENHANCED RULE 5: Prevent Nested Row Layouts
    if (dragItem.item?.type === 'horizontal_layout' && targetItem.type === 'horizontal_layout') {
      // Row layout onto row layout - convert to vertical positioning
      return 'bottom'; // Place below existing row layout
    }
    
    return position;
  }, [detectRowLayoutContext]);

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
      
      // Apply enhanced layout constraints
      const constrainedPosition = applyEnhancedLayoutConstraints(position, dragItem, item);
      setDropPosition(constrainedPosition);
    },
    drop: (dragItem: DragItem, monitor) => {
      // Prevent event bubbling to parent drop zones
      if (monitor.didDrop()) return;
      
      const position = calculateDropPosition(monitor.getClientOffset());
      const constrainedPosition = applyEnhancedLayoutConstraints(position, dragItem, item);
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
      isOver: monitor.isOver(), // Enhanced visual highlighting zones
    }),
  });

  const renderDropZoneHighlights = () => {
    if (!isOver || !dropPosition) return null;

    const layoutContext = detectRowLayoutContext();
    
    return (
      <>
        {/* Top zone highlight - always available for vertical layout */}
        {(dropPosition === 'top' || dropPosition.includes('top')) && (
          <div className={`${cssPrefix}__drop-highlight ${cssPrefix}__drop-highlight--top`}>
            <span className={`${cssPrefix}__drop-label`}>Drop Above (Column Layout)</span>
          </div>
        )}
        
        {/* Bottom zone highlight - always available for vertical layout */}
        {(dropPosition === 'bottom' || dropPosition.includes('bottom')) && (
          <div className={`${cssPrefix}__drop-highlight ${cssPrefix}__drop-highlight--bottom`}>
            <span className={`${cssPrefix}__drop-label`}>Drop Below (Column Layout)</span>
          </div>
        )}
        
        {/* Left zone highlight - intelligent row layout handling */}
        {(dropPosition === 'left' || dropPosition.includes('left')) && (
          <div className={`${cssPrefix}__drop-highlight ${cssPrefix}__drop-highlight--left`}>
            <span className={`${cssPrefix}__drop-label`}>
              {layoutContext.isCurrentRowLayout 
                ? 'Add to Row Layout (Left)' 
                : 'Create Row Layout (Left)'}
            </span>
          </div>
        )}
        
        {/* Right zone highlight - intelligent row layout handling */}
        {(dropPosition === 'right' || dropPosition.includes('right')) && (
          <div className={`${cssPrefix}__drop-highlight ${cssPrefix}__drop-highlight--right`}>
            <span className={`${cssPrefix}__drop-label`}>
              {layoutContext.isCurrentRowLayout 
                ? 'Add to Row Layout (Right)' 
                : 'Create Row Layout (Right)'}
            </span>
          </div>
        )}
        
        {/* Center zone highlight */}
        {dropPosition === 'center' && (
          <div className={`${cssPrefix}__drop-highlight ${cssPrefix}__drop-highlight--center`}>
            <span className={`${cssPrefix}__drop-label`}>Replace/Insert</span>
          </div>
        )}
        
        {/* Special row layout formation highlights */}
        {dropPosition.startsWith('form-row-') && (
          <div className={`${cssPrefix}__drop-highlight ${cssPrefix}__drop-highlight--form-row`}>
            <span className={`${cssPrefix}__drop-label`}>
              Form New Row Layout ({dropPosition.replace('form-row-', '').toUpperCase()})
            </span>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      ref={(node) => {
        ref.current = node;
        drag(drop(node));
      }}
      className={[
        `${cssPrefix}__item`,
        selectedItemId === item.id && `${cssPrefix}__item--selected`,
        isDragging && `${cssPrefix}__item--dragging`,
        isOver && `${cssPrefix}__item--hover`,
        dropPosition && `${cssPrefix}__item--drop-${dropPosition.replace('form-row-', 'form-row-')}`
      ].filter(Boolean).join(' ')}
      data-testid={`canvas-item-${index}`}
      data-item-id={item.id}
      data-item-type={item.type}
    >
      {/* Enhanced drop zone highlights */}
      {renderDropZoneHighlights()}
      
      {/* Drop position indicator */}
      {isOver && dropPosition && (
        <div className={`form-canvas__drop-indicator form-canvas__drop-indicator--${dropPosition}`}>
          <span className="drop-indicator">
            {dropPosition === 'left' ? '← Drop Left' : 
             dropPosition === 'right' ? 'Drop Right →' :
             dropPosition === 'top' ? '↑ Drop Above' :
             dropPosition === 'bottom' ? '↓ Drop Below' : 
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
            onItemDelete?.(item.id);
          }}
          aria-label="Delete item"
        >
          ×
        </button>
      </div>
      
      {renderItem(item, {
        isSelected: selectedItemId === item.id,
        isDragging,
        isHover: isOver,
        cssPrefix
      })}
    </div>
  );
};
