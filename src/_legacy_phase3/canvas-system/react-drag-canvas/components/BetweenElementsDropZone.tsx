/**
 * BetweenElementsDropZone - NPM Package Ready Pattern
 * 
 * This component represents the modern, generic approach for between-element drops.
 * 
 * ARCHITECTURAL NOTE: This is intentionally separate from the legacy BetweenDropZone
 * in shared/components/ which uses a different callback pattern for backward compatibility.
 * 
 * Key Differences:
 * - Uses: onItemAdd(string, {type, targetIndex}) - Generic, NPM-ready
 * - Legacy uses: onInsertBetween(ComponentType, index) - Internal/test specific
 * 
 * Both patterns are maintained intentionally for different architectural needs.
 */

import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import type { DragItem } from '../types';

interface BetweenElementsDropZoneProps {
  beforeIndex: number;
  afterIndex: number;
  onItemAdd?: (itemType: string, position: { type: string; targetIndex?: number }) => void;
  config: {
    cssPrefix: string;
  };
}

export const BetweenElementsDropZone: React.FC<BetweenElementsDropZoneProps> = ({
  beforeIndex,
  afterIndex,
  onItemAdd,
  config
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const [{ isOver }, drop] = useDrop({
    accept: ['new-item'],
    hover: () => setIsHovering(true),
    drop: (dragItem: DragItem) => {
      if (dragItem.type === 'new-item' && dragItem.itemType && onItemAdd) {
        // Insert between the two elements at afterIndex position
        onItemAdd(dragItem.itemType, { 
          type: 'between', 
          targetIndex: afterIndex 
        });
      }
      setIsHovering(false);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    }),
  });

  React.useEffect(() => {
    if (!isOver) {
      setIsHovering(false);
    }
  }, [isOver]);

  return (
    <div
      ref={drop}
      className={`
        between-elements-drop-zone
        ${config.cssPrefix}__between-drop-zone
        ${isOver || isHovering ? 'is-active' : ''}
      `.trim()}
      data-testid={`between-drop-zone-${beforeIndex}-${afterIndex}`}
      style={{
        height: isOver || isHovering ? '24px' : '8px',
        margin: '4px 0',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
    >
      {(isOver || isHovering) && (
        <div className="drop-indicator-between">
          <div 
            className="drop-label"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--color-primary-600)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              zIndex: 1001
            }}
          >
            Drop here to insert
          </div>
        </div>
      )}
    </div>
  );
};