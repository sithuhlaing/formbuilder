/**
 * Simplified Drop Zone Component
 * Implements visual feedback based on the 35%/50% rule system
 */

import React, { useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { COMPONENT_TYPE } from '../../../dnd/types';
import type { Page, FormComponentData, ComponentType } from '../../../types';
import SmartCanvasItem from './SmartCanvasItem';
import { getDropIntent, type Intent } from '../core/drop-intent';
import { DropIndicators } from './DropIndicators';
import type { Intent } from '../core/types';

interface SimplifiedDropZoneProps {
  component: FormComponentData;
  index: number;
  onDrop: (draggedItem: any, targetId: string, intent: Intent, targetIndex: number) => void;
  children: React.ReactNode;
}

const SimplifiedDropZone: React.FC<SimplifiedDropZoneProps> = ({
  component,
  index,
  onDrop,
  children
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['component', 'canvas-item'],
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    hover: (item: any, monitor) => {
      if (!ref.current) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        setCurrentIntent(null);
        return;
      }

      const targetRect = ref.current.getBoundingClientRect();
      const intent = getDropIntent(clientOffset, targetRect);
      setCurrentIntent(intent);
    },
    drop: (item: any, monitor) => {
      if (!monitor.didDrop() && currentIntent) {
        onDrop(item, component.id, currentIntent, index);
      }
      setCurrentIntent(null);
    }
  });

  drop(ref);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Visual feedback overlays */}
      {isOver && canDrop && currentIntent && (
        <DropIndicators intent={currentIntent} />
      )}
      {children}
    </div>
  );
};

export default SimplifiedDropZone;