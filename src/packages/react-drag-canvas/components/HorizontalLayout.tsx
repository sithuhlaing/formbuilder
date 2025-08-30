/**
 * HorizontalLayout Component - Handles horizontal layout rendering
 * SOLID: Single Responsibility - Only handles horizontal layout display
 */

import React from 'react';
import { useDrop } from 'react-dnd';
import { SmartDropZone } from './SmartDropZone';
import type { HorizontalLayoutProps, DragItem } from '../types';

export const HorizontalLayout: React.FC<HorizontalLayoutProps> = ({
  item,
  index,
  renderItem,
  onItemDelete,
  onItemMove,
  onLayoutCreate,
  selectedItemId,
  cssPrefix,
  config
}) => {
  const children = item.children || [];

  // Drop functionality for the horizontal layout container
  const [{ isOver }, drop] = useDrop({
    accept: ['new-component', 'existing-component'],
    drop: (dragItem: DragItem, monitor) => {
      if (monitor.didDrop()) return; // Prevent duplicate drops
      
      // Handle drops within horizontal layout
      if (dragItem.componentType && onLayoutCreate) {
        onLayoutCreate(dragItem.componentType, item.id, 'right');
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  });

  return (
    <div 
      ref={drop}
      className={`${cssPrefix}__horizontal-layout horizontal-layout ${isOver ? 'is-drop-target' : ''}`}
      data-testid="row-layout"
      data-component-id={item.id}
      data-component-type={item.type}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        padding: '8px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        backgroundColor: isOver ? '#f0f9ff' : '#fafafa',
        minHeight: '60px',
        alignItems: 'stretch'
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
              onItemMove={onItemMove}
              onLayoutCreate={onLayoutCreate}
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
              backgroundColor: isOver ? '#e0f2fe' : 'transparent'
            }}
          >
            Drop here to add
          </div>
        )}
      </div>
    </div>
  );
};
