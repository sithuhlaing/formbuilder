/**
 * Generic Drag-Drop Canvas Component
 * SOLID: Refactored to use extracted components and segregated interfaces
 */

import React from 'react';
import { useDrop } from 'react-dnd';
import { SmartDropZone } from './SmartDropZone';
import { RowLayout } from './RowLayout';
import { BetweenElementsDropZone } from './BetweenElementsDropZone';
import type { DragDropCanvasProps, DragItem } from '../types';

export const DragDropCanvas: React.FC<DragDropCanvasProps> = ({
  items,
  renderItem,
  onItemMove,
  onLayoutCreate,
  onItemDelete,
  onItemAdd,
  onAddToLayout,
  selectedItemId,
  config = {},
  className = '',
}) => {
  const {
    cssPrefix = 'canvas',
    enableHorizontalLayouts = true,
    enableVerticalLayouts = true,
    dropZoneThresholds = { horizontal: 0.25, vertical: 0.3 }
  } = config;

  // Create required config for child components
  const requiredConfig = {
    cssPrefix,
    enableHorizontalLayouts,
    enableVerticalLayouts,
    dropZoneThresholds
  };

  // ============================================================================
  // MAIN CANVAS DROP ZONE
  // ============================================================================

  const [{ isOver }, drop] = useDrop({
    accept: ['new-item'],
    drop: (dragItem: DragItem, monitor) => {
      // Only handle drops that haven't been handled by child components
      if (monitor.didDrop()) return;
      
      if (dragItem.type === 'new-item' && dragItem.itemType && onItemAdd) {
        // Add to end of canvas when dropped on empty space
        onItemAdd(dragItem.itemType, { type: 'center' });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  // ============================================================================
  // RENDER CANVAS
  // ============================================================================

  return (
    <div 
      ref={(node) => {
        drop(node);
      }}
      className={`drag-drop-canvas ${isOver ? 'is-drop-target' : ''} ${className}`.trim()}
      data-testid="canvas-drop-zone"
    >
      {items.length === 0 ? (
        <div className="canvas-drop-zone">
          <div className="canvas-empty-state">
            <div className="canvas-empty-state__icon">📋</div>
            <h3 className="canvas-empty-state__title">Add components here</h3>
            <p className="canvas-empty-state__description">
              Drag components from the left panel to start building your form
            </p>
          </div>
        </div>
      ) : (
        <div className="canvas-content">
          {items.map((item, index) => {
            const itemElement = item.type === 'horizontal_layout' ? (
              <RowLayout
                key={item.id}
                item={item}
                index={index}
                renderItem={renderItem}
                onItemDelete={onItemDelete}
                onItemMove={onItemMove}
                onLayoutCreate={onLayoutCreate}
                onAddToLayout={onAddToLayout}
                selectedItemId={selectedItemId}
                config={requiredConfig}
              />
            ) : (
              <SmartDropZone
                key={item.id}
                item={item}
                index={index}
                renderItem={renderItem}
                onItemMove={onItemMove}
                onLayoutCreate={onLayoutCreate}
                onItemDelete={onItemDelete}
                onItemAdd={onItemAdd}
                onAddToLayout={onAddToLayout}
                selectedItemId={selectedItemId}
                config={requiredConfig}
              />
            );

            // Add between-element drop zone after each item (except the last)
            if (index < items.length - 1) {
              return (
                <React.Fragment key={`item-${item.id}`}>
                  {itemElement}
                  <BetweenElementsDropZone
                    beforeIndex={index}
                    afterIndex={index + 1}
                    onItemAdd={onItemAdd}
                    config={requiredConfig}
                  />
                </React.Fragment>
              );
            }

            return itemElement;
          })}
          
          {/* Bottom drop zone for adding items at the end */}
          <div 
            className={`canvas-bottom-drop-zone ${isOver ? 'is-active' : ''}`}
            data-testid="canvas-bottom-drop-zone"
          >
            <div className="drop-zone-indicator">
              <span className="drop-zone-text">Drop component here to add at the end</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
