/**
 * Fixed Boundary Drop Zone Component
 * Implements the simplified drag-and-drop rules with 35% left/right zones and 50% top/bottom zones
 * Canvas boundary stays fixed - only content arrangement changes
 */

import React, { useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { SimpleDragDropRules } from '../Canvas/core/DragDropRules';
import type { Intent } from '../Canvas/core/types';
import type { FormComponentData } from '../../types';

interface FixedBoundaryDropZoneProps {
  component: FormComponentData;
  index: number;
  onDrop: (draggedItem: any, targetId: string, intent: Intent, targetIndex: number) => void;
  isMobile: boolean;
  children: React.ReactNode;
}

const FixedBoundaryDropZone: React.FC<FixedBoundaryDropZoneProps> = ({
  component,
  index,
  onDrop,
  isMobile,
  children
}) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragIntent, setDragIntent] = useState<Intent | null>(null);
  const dropRules = new SimpleDragDropRules();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['component'],
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    hover: (item, monitor) => {
      if (!dropRef.current || !monitor.isOver({ shallow: true })) {
        setDragIntent(null);
        return;
      }

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const dropRect = dropRef.current.getBoundingClientRect();
      const intent = dropRules.calculateIntent(clientOffset, dropRect);
      setDragIntent(intent);
    },
    drop: (item: any, monitor) => {
      if (!monitor.didDrop() && dragIntent) {
        console.log('🎯 Fixed boundary drop:', { 
          draggedType: item.type || 'canvas-component', 
          targetId: component.id, 
          intent: dragIntent,
          targetIndex: index,
          boundaryChange: 'none (fixed to viewport)'
        });
        onDrop(item, component.id, dragIntent, index);
      }
      setDragIntent(null);
    }
  });

  drop(dropRef);

  const getZoneStyle = (zoneIntent: Intent) => {
    const isActive = dragIntent === zoneIntent;
    const baseStyle = {
      position: 'absolute' as const,
      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
      border: isActive ? '2px solid #3b82f6' : '2px solid transparent',
      borderRadius: '4px',
      pointerEvents: 'none' as const,
      transition: 'all 0.2s ease',
      zIndex: 10
    };

    switch (zoneIntent) {
      case 'LEFT':
        return {
          ...baseStyle,
          left: '0%',
          top: '0%',
          width: '35%',
          height: '100%'
        };
      case 'RIGHT':
        return {
          ...baseStyle,
          right: '0%',
          top: '0%',
          width: '35%',
          height: '100%'
        };
      case 'BEFORE':
        return {
          ...baseStyle,
          left: '35%',
          top: '0%',
          width: '30%',
          height: '50%'
        };
      case 'AFTER':
        return {
          ...baseStyle,
          left: '35%',
          bottom: '0%',
          width: '30%',
          height: '50%'
        };
      default:
        return { ...baseStyle, display: 'none' };
    }
  };

  return (
    <div
      ref={dropRef}
      style={{
        position: 'relative',
        minHeight: isMobile ? '60px' : '80px',
        backgroundColor: isOver && canDrop ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
        border: isOver && canDrop ? '1px dashed #3b82f6' : '1px solid transparent',
        borderRadius: '6px',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Drop zone indicators - only show when dragging over */}
      {isOver && canDrop && (
        <>
          <div style={getZoneStyle('LEFT')} />
          <div style={getZoneStyle('RIGHT')} />
          <div style={getZoneStyle('BEFORE')} />
          <div style={getZoneStyle('AFTER')} />
          
          {/* Intent indicator */}
          {dragIntent && (
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#3b82f6',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: '500',
              zIndex: 20
            }}>
              {dragIntent === 'LEFT' ? '← LEFT' : 
               dragIntent === 'RIGHT' ? 'RIGHT →' :
               dragIntent === 'BEFORE' ? '↑ BEFORE' : '↓ AFTER'}
            </div>
          )}
        </>
      )}

      {/* Render the actual component */}
      {children}

      {/* Fixed boundary indicator */}
      {isOver && canDrop && (
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '9px',
          fontFamily: 'monospace',
          zIndex: 20
        }}>
          Boundary: Fixed
        </div>
      )}
    </div>
  );
};

export default FixedBoundaryDropZone;