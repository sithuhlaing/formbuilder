import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import type { DragItem } from '../types';
import type { IDropZoneStrategy } from '../strategies/DropZoneStrategy';

interface CanvasDropZoneProps {
  strategy: IDropZoneStrategy;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const CanvasDropZone: React.FC<CanvasDropZoneProps> = ({ 
  strategy, 
  children, 
  className = '',
  style = {}
}) => {
  const dropRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: strategy.getAcceptedTypes(),
    drop: (item: DragItem, monitor) => {
      if (!monitor.didDrop()) {
        strategy.handleDrop(item);
      }
      return { droppedOnCanvas: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  }));

  drop(dropRef);

  const combinedStyle: React.CSSProperties = {
    ...style,
    backgroundColor: isOver ? '#eff6ff' : style.backgroundColor,
    borderColor: isOver ? '#3b82f6' : style.borderColor,
    transition: 'all 0.2s ease'
  };

  return (
    <div
      ref={dropRef}
      className={className}
      style={combinedStyle}
    >
      {children}
    </div>
  );
};

export default CanvasDropZone;