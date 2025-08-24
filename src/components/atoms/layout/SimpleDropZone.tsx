
import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import type { ComponentType } from '../../types/component';

interface DropZoneProps {
  componentId: string;
  onDropWithPosition: (type: ComponentType, targetId: string, position: 'left' | 'right' | 'top' | 'bottom' | null) => void;
  children: React.ReactNode;
}

const SimpleDropZone: React.FC<DropZoneProps> = ({
  componentId,
  onDropWithPosition,
  children
}) => {
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: { type: ComponentType }) => {
      onDropWithPosition(item.type, componentId, 'bottom');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Connect the drop target to the ref
  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={`
        relative transition-all duration-200
        ${isOver ? 'bg-blue-50 border-blue-300' : ''}
      `}
    >
      {children}
    </div>
  );
};

export default SimpleDropZone;
