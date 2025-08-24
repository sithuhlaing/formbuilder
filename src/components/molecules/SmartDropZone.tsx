import React, { useState, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import type { DropTargetMonitor } from 'react-dnd';
import type { ComponentType } from '../types';

interface SmartDropZoneProps {
  componentId: string;
  onDropWithPosition: (type: ComponentType, targetId: string, position: 'left' | 'right' | 'top' | 'bottom') => void;
  children: React.ReactNode;
  isInHorizontalContainer?: boolean;
  horizontalContainerCount?: number;
}

type DropPosition = 'left' | 'right' | 'top' | 'bottom' | null;

const SmartDropZone: React.FC<SmartDropZoneProps> = ({ 
  componentId, 
  onDropWithPosition, 
  children,
  isInHorizontalContainer = false,
  horizontalContainerCount = 0
}) => {
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const getDropPosition = useCallback((clientX: number, clientY: number): DropPosition => {
    if (!dropRef.current) return null;
    
    const rect = dropRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    const threshold = 0.3; // 30% from edge
    const xThreshold = rect.width * threshold;
    const yThreshold = rect.height * threshold;
    
    // Determine which edge is closest
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal split - check limits
      const canAddHorizontal = !isInHorizontalContainer || horizontalContainerCount < 12;
      
      if (deltaX < -xThreshold && canAddHorizontal) return 'left';
      if (deltaX > xThreshold && canAddHorizontal) return 'right';
    } else {
      // Vertical split - unlimited
      if (deltaY < -yThreshold) return 'top';
      if (deltaY > yThreshold) return 'bottom';
    }
    
    return null;
  }, [isInHorizontalContainer, horizontalContainerCount]);

  const [{ isOver }, drop] = useDrop<
    { type: ComponentType },
    void,
    { isOver: boolean }
  >({
    accept: "component",
    hover: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        setDropPosition(null);
        return;
      }
      
      const position = getDropPosition(clientOffset.x, clientOffset.y);
      setDropPosition(position);
    },
    drop: (item: { type: ComponentType }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const position = getDropPosition(clientOffset.x, clientOffset.y);
      if (position && item.type) {
        onDropWithPosition(item.type, componentId, position);
      }
      setDropPosition(null);
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  // Connect drop ref
  drop(dropRef);

  const getDropIndicatorStyles = (position: DropPosition) => {
    if (!dropPosition || dropPosition !== position) return { opacity: 0 };
    
    const baseStyles = {
      position: 'absolute' as const,
      backgroundColor: 'var(--color-primary-500)',
      opacity: 1,
      zIndex: 1000,
      transition: 'all 0.2s ease',
    };
    
    switch (position) {
      case 'left':
        return {
          ...baseStyles,
          left: '-2px',
          top: '0',
          width: '4px',
          height: '100%',
          borderRadius: '2px',
        };
      case 'right':
        return {
          ...baseStyles,
          right: '-2px',
          top: '0',
          width: '4px', 
          height: '100%',
          borderRadius: '2px',
        };
      case 'top':
        return {
          ...baseStyles,
          top: '-2px',
          left: '0',
          width: '100%',
          height: '4px',
          borderRadius: '2px',
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: '-2px',
          left: '0',
          width: '100%',
          height: '4px',
          borderRadius: '2px',
        };
      default:
        return { opacity: 0 };
    }
  };

  return (
    <div
      ref={dropRef}
      className={`smart-drop-zone ${isOver ? 'is-drop-target' : ''}`}
      style={{ position: 'relative' }}
    >
      {/* Drop indicators */}
      <div style={getDropIndicatorStyles('left')} className="drop-indicator drop-indicator--left" />
      <div style={getDropIndicatorStyles('right')} className="drop-indicator drop-indicator--right" />
      <div style={getDropIndicatorStyles('top')} className="drop-indicator drop-indicator--top" />
      <div style={getDropIndicatorStyles('bottom')} className="drop-indicator drop-indicator--bottom" />
      
      {/* Position labels for better UX */}
      {isOver && dropPosition && (
        <div className={`drop-position-label drop-position-label--${dropPosition}`}>
          {dropPosition === 'left' && `← Add Left (${(horizontalContainerCount || 0) + 1}/12)`}
          {dropPosition === 'right' && `Add Right → (${(horizontalContainerCount || 0) + 1}/12)`}
          {dropPosition === 'top' && '↑ Add Above'}
          {dropPosition === 'bottom' && 'Add Below ↓'}
        </div>
      )}
      
      {/* Grid limit warning */}
      {isOver && isInHorizontalContainer && horizontalContainerCount >= 12 && (
        <div className="grid-limit-warning">
          Maximum 12 columns reached. Use top/bottom to create new row.
        </div>
      )}
      
      {children}
    </div>
  );
};

export default SmartDropZone;