/**
 * Simplified Drop Zone Component
 * Implements visual feedback based on the 35%/50% rule system
 */

import React, { useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { SimpleDragDropRules, Intent } from '../core/DragDropRules';
import type { FormComponentData, ComponentType } from '../../../types';

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
  const dropRules = new SimpleDragDropRules();

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
      const intent = dropRules.calculateIntent(clientOffset, targetRect);
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

interface DropIndicatorsProps {
  intent: Intent;
}

const DropIndicators: React.FC<DropIndicatorsProps> = ({ intent }) => {
  const getIndicatorStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
      pointerEvents: 'none' as const,
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: '2px'
    };

    switch (intent) {
      case 'LEFT':
        return {
          ...baseStyles,
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: 'rgba(245, 158, 11, 0.8)' // Orange for horizontal
        };
      case 'RIGHT':
        return {
          ...baseStyles,
          right: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: 'rgba(245, 158, 11, 0.8)' // Orange for horizontal
        };
      case 'BEFORE':
        return {
          ...baseStyles,
          left: 0,
          right: 0,
          top: 0,
          height: '4px',
          backgroundColor: 'rgba(59, 130, 246, 0.8)' // Blue for vertical
        };
      case 'AFTER':
        return {
          ...baseStyles,
          left: 0,
          right: 0,
          bottom: 0,
          height: '4px',
          backgroundColor: 'rgba(59, 130, 246, 0.8)' // Blue for vertical
        };
      default:
        return { ...baseStyles, display: 'none' };
    }
  };

  return <div style={getIndicatorStyles()} />;
};

export default SimplifiedDropZone;