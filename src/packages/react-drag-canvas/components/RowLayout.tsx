/**
 * RowLayout Component
 * Renders a row layout container with drag-drop support
 * This is specifically for horizontal row layouts (different from HorizontalLayout)
 */

import React, { useRef } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { SmartDropZone } from './SmartDropZone';
import type { CanvasItem, DragItem } from '../types';

interface RowLayoutProps {
  item: CanvasItem;
  index: number;
  renderItem: (item: CanvasItem, context: any) => React.ReactNode;
  onItemDelete: (itemId: string) => void;
  onItemMove?: (dragIndex: number, hoverIndex: number) => void;
  onLayoutCreate?: (componentType: string, targetId: string, side: 'left' | 'right') => void;
  onAddToLayout?: (itemType: string, layoutId: string) => void;
  selectedItemId?: string;
  cssPrefix?: string;
  config?: any;
}

export const RowLayout: React.FC<RowLayoutProps> = ({
  item,
  index,
  renderItem,
  onItemDelete,
  onItemMove,
  onLayoutCreate,
  onAddToLayout,
  selectedItemId,
  cssPrefix = 'canvas',
  config
}) => {
  const children = item.children || [];
  const ref = useRef<HTMLDivElement>(null);

  // Drag functionality for the entire row layout - constrained to vertical movement only
  const [{ isDragging }, drag] = useDrag({
    type: 'existing-item',
    item: {
      type: 'existing-item',
      id: item.id,
      sourceId: item.id,
      item: item,
      dragType: 'row-layout', // This identifies it as a row layout for constraint application
      index: index
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  // Drop functionality for the row layout container
  const [{ isOver }, drop] = useDrop({
    accept: ['new-item', 'existing-item'],
    drop: (dragItem: DragItem, monitor) => {
      if (monitor.didDrop()) return; // Prevent duplicate drops
      
      // Handle drops within row layout - add to existing layout instead of creating new one
      const componentType = dragItem.itemType || (dragItem.item && dragItem.item.type);
      if (componentType && onAddToLayout) {
        console.log('RowLayout: Adding component to existing layout:', componentType, item.id);
        onAddToLayout(componentType, item.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  });

  // Combine drag and drop refs with the component ref
  drag(drop(ref));

  return (
    <div 
      ref={ref}
      className={`${cssPrefix}__row-layout row-layout ${isOver ? 'is-drop-target' : ''} ${isDragging ? 'is-dragging' : ''}`}
      data-testid="row-layout"
      data-component-id={item.id}
      data-component-type={item.type}
      data-layout-index={index}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        padding: '8px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        backgroundColor: isOver ? '#f0f9ff' : '#fafafa',
        minHeight: '60px',
        alignItems: 'stretch',
        position: 'relative',
        opacity: isDragging ? 0.7 : 1,
        cursor: 'move'
      }}
    >
      {/* Layout header with drag handle */}
      <div className={`${cssPrefix}__layout-header`} style={{
        position: 'absolute',
        top: '-8px',
        left: '8px',
        backgroundColor: '#fff',
        padding: '2px 8px',
        fontSize: '12px',
        color: '#666',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span className={`${cssPrefix}__drag-handle`} style={{
          cursor: 'move',
          color: '#9ca3af',
          fontSize: '14px',
          lineHeight: 1,
          userSelect: 'none'
        }}>
          ⋮⋮
        </span>
        <span className={`${cssPrefix}__layout-label`}>
          Row Layout ({children.length} items)
        </span>
        <button
          className={`${cssPrefix}__delete-btn`}
          onClick={(e) => {
            e.stopPropagation();
            onItemDelete?.(item.id);
          }}
          aria-label="Delete layout"
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Layout content - horizontal flex container */}
      <div className={`${cssPrefix}__layout-content`} style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        flex: 1,
        alignItems: 'stretch',
        minHeight: '50px'
      }}>
        {children.map((child, childIndex) => (
          <div
            key={child.id}
            data-testid={`row-item-${childIndex}`}
            className={`${cssPrefix}__layout-item`}
            style={{
              flex: '1',
              minWidth: '120px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <SmartDropZone
              item={child}
              index={childIndex}
              renderItem={renderItem}
              onItemDelete={onItemDelete}
              onItemMove={onItemMove || (() => {})}
              onLayoutCreate={onLayoutCreate || (() => {})}
              selectedItemId={selectedItemId}
              config={config}
            />
          </div>
        ))}
        
        {/* Drop zone for adding new items to the end of the row */}
        {children.length < 4 && (
          <div 
            className={`${cssPrefix}__add-to-row`}
            style={{
              flex: '0 0 120px',
              minHeight: '50px',
              border: '2px dashed #d1d5db',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '12px',
              backgroundColor: isOver ? '#e0f2fe' : 'transparent',
              pointerEvents: 'none' // Prevent interference with container drop
            }}
          >
            Drop here to add
          </div>
        )}
      </div>
    </div>
  );
};
