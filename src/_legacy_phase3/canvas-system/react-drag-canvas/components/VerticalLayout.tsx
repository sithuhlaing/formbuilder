/**
 * VerticalLayout Component
 * Renders a vertical layout container with drag-drop support
 */

import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { SmartDropZone } from './SmartDropZone';
import type { CanvasItem, DragItem } from '../types';

interface VerticalLayoutProps {
  item: CanvasItem;
  index: number;
  renderItem: (item: CanvasItem, context: any) => React.ReactNode;
  onItemDelete: (itemId: string) => void;
  onItemMove?: (dragIndex: number, hoverIndex: number) => void;
  onLayoutCreate?: (componentType: string, targetId: string, side: 'left' | 'right' | 'top' | 'bottom') => void;
  selectedItemId?: string;
  cssPrefix?: string;
  config?: any;
}

export const VerticalLayout: React.FC<VerticalLayoutProps> = ({
  item,
  index,
  renderItem,
  onItemDelete,
  onItemMove,
  onLayoutCreate,
  selectedItemId,
  cssPrefix = 'canvas',
  config
}) => {
  const children = item.children || [];
  const ref = useRef<HTMLDivElement>(null);

  // Drop functionality for the vertical layout container
  const [{ isOver }, drop] = useDrop({
    accept: ['new-item', 'existing-item'],
    drop: (dragItem: DragItem, monitor) => {
      if (monitor.didDrop()) return; // Prevent duplicate drops
      
      // Handle drops within vertical layout
      const componentType = dragItem.itemType || dragItem.type;
      if (componentType && onLayoutCreate) {
        onLayoutCreate(componentType, item.id, 'bottom');
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  });

  // Combine drop ref with the component ref
  drop(ref);

  return (
    <div 
      ref={ref}
      className={`${cssPrefix}__vertical-layout vertical-layout ${isOver ? 'is-drop-target' : ''}`}
      data-testid={`column-layout-${index}`}
      data-component-id={item.id}
      data-component-type={item.type}
      data-layout-index={index}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '8px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        backgroundColor: isOver ? '#f0f9ff' : '#fafafa',
        minHeight: '120px',
        position: 'relative'
      }}
    >
      {/* Layout header */}
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
        <span className={`${cssPrefix}__layout-label`}>
          Column Layout ({children.length} items)
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

      {/* Layout content - vertical flex container */}
      <div className={`${cssPrefix}__layout-content`} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flex: 1,
        minHeight: '100px'
      }}>
        {children.map((child, childIndex) => (
          <div
            key={child.id}
            data-testid={`column-item-${childIndex}`}
            className={`${cssPrefix}__layout-item`}
            style={{
              minHeight: '50px',
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
        
        {/* Drop zone for adding new items to the end of the column */}
        <div 
          className={`${cssPrefix}__add-to-column`}
          style={{
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
      </div>
    </div>
  );
};
