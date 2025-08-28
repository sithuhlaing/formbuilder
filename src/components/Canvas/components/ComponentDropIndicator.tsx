import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import type { DragItem } from '../types';
import type { IDropZoneStrategy } from '../strategies/DropZoneStrategy';

interface ComponentDropIndicatorProps {
  strategy: IDropZoneStrategy;
}

const ComponentDropIndicator: React.FC<ComponentDropIndicatorProps> = ({ strategy }) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver }, dropZone] = useDrop(() => ({
    accept: strategy.getAcceptedTypes(),
    drop: (item: DragItem) => {
      strategy.handleDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  dropZone(dropZoneRef);

  return (
    <div
      ref={dropZoneRef}
      style={{
        height: isOver ? '40px' : '4px',
        backgroundColor: isOver ? '#dbeafe' : 'transparent',
        border: isOver ? '2px dashed #3b82f6' : 'none',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: isOver ? '8px 0' : '2px 0',
        fontSize: '12px',
        color: '#6b7280'
      }}
    >
      {isOver && strategy.getDropIndicatorText()}
    </div>
  );
};

export default ComponentDropIndicator;