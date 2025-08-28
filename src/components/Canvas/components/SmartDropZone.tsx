import React from 'react';
import { useDrop } from 'react-dnd';
import { PositionDetector } from '../utils/PositionDetector';
import type { ComponentType } from '../../../types';
import type { PositionDetectionResult } from '../types/positioning';

interface SmartDropZoneProps {
  onSmartDrop: (result: PositionDetectionResult & { componentType: ComponentType }) => void;
  targetId: string;
  targetIndex: number;
  position: 'top' | 'bottom';
}

const SmartDropZone: React.FC<SmartDropZoneProps> = ({ onSmartDrop, targetId, targetIndex, position }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['component', 'nested-component'],
    drop: (item: { type: ComponentType }, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      onSmartDrop({
        position,
        targetId,
        targetIndex,
        componentType: item.type,
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className="smart-drop-zone"
      style={{
        height: '10px',
        backgroundColor: isOver && canDrop ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
        transition: 'background-color 150ms ease-in-out',
        margin: '-5px 0',
        zIndex: 10,
      }}
    />
  );
};

export default SmartDropZone;