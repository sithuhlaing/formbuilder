import React, { useState, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import type { DropTargetMonitor } from 'react-dnd';
import type { ComponentType } from '../types';

interface SurveyDropZoneProps {
  children: React.ReactNode;
  onInsertBetween: (type: ComponentType, insertIndex: number) => void;
  onInsertHorizontal: (type: ComponentType, targetId: string, position: 'left' | 'right') => void;
  componentCount: number;
}

type DropSegment = {
  type: 'between' | 'left' | 'right';
  index: number;
  targetId?: string;
} | null;

const SurveyDropZone: React.FC<SurveyDropZoneProps> = ({
  children,
  onInsertBetween,
  onInsertHorizontal,
  componentCount
}) => {
  const [activeSegment, setActiveSegment] = useState<DropSegment>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const dropRef = useRef<HTMLDivElement>(null);

  const getDropSegment = useCallback((clientX: number, clientY: number): DropSegment => {
    if (!dropRef.current) return null;

    const container = dropRef.current;
    const rect = container.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const relativeX = clientX - rect.left;

    // Get all form components in the container
    const components = container.querySelectorAll('.form-component');
    
    for (let i = 0; i < components.length; i++) {
      const component = components[i] as HTMLElement;
      const compRect = component.getBoundingClientRect();
      const compRelativeTop = compRect.top - rect.top;
      const compRelativeBottom = compRect.bottom - rect.top;
      const compRelativeLeft = compRect.left - rect.left;
      const compRelativeRight = compRect.right - rect.left;

      // Check if hovering over this component
      if (relativeY >= compRelativeTop && relativeY <= compRelativeBottom) {
        const componentId = component.getAttribute('data-component-id');
        
        // Check horizontal segments (left/right of component)
        const horizontalThreshold = compRect.width * 0.3;
        
        if (relativeX >= compRelativeLeft && relativeX <= compRelativeLeft + horizontalThreshold) {
          // Left side of component
          return {
            type: 'left',
            index: i,
            targetId: componentId || undefined
          };
        } else if (relativeX >= compRelativeRight - horizontalThreshold && relativeX <= compRelativeRight) {
          // Right side of component  
          return {
            type: 'right',
            index: i,
            targetId: componentId || undefined
          };
        }
      }

      // Check between segments (vertical gaps between components)
      if (i < components.length - 1) {
        const nextComponent = components[i + 1] as HTMLElement;
        const nextRect = nextComponent.getBoundingClientRect();
        const gapTop = compRect.bottom - rect.top;
        const gapBottom = nextRect.top - rect.top;
        
        if (relativeY >= gapTop - 10 && relativeY <= gapBottom + 10) {
          return {
            type: 'between',
            index: i + 1
          };
        }
      }
    }

    // Check for drop at the end
    if (components.length > 0) {
      const lastComponent = components[components.length - 1] as HTMLElement;
      const lastRect = lastComponent.getBoundingClientRect();
      const lastBottom = lastRect.bottom - rect.top;
      
      if (relativeY > lastBottom) {
        return {
          type: 'between',
          index: components.length
        };
      }
    }

    // Drop at the beginning if above all components
    if (components.length > 0) {
      const firstComponent = components[0] as HTMLElement;
      const firstRect = firstComponent.getBoundingClientRect();
      const firstTop = firstRect.top - rect.top;
      
      if (relativeY < firstTop) {
        return {
          type: 'between',
          index: 0
        };
      }
    }

    // Default to end if no components
    return {
      type: 'between',
      index: 0
    };
  }, []);

  const [{ isOver }, drop] = useDrop<
    { type: ComponentType },
    void,
    { isOver: boolean }
  >({
    accept: "component",
    hover: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        setActiveSegment(null);
        return;
      }
      
      setMousePosition({ x: clientOffset.x, y: clientOffset.y });
      const segment = getDropSegment(clientOffset.x, clientOffset.y);
      setActiveSegment(segment);
    },
    drop: (item: { type: ComponentType }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const segment = getDropSegment(clientOffset.x, clientOffset.y);
      if (!segment || !item.type) return;

      if (segment.type === 'between') {
        onInsertBetween(item.type, segment.index);
      } else if (segment.type === 'left' || segment.type === 'right') {
        if (segment.targetId) {
          onInsertHorizontal(item.type, segment.targetId, segment.type);
        }
      }
      
      setActiveSegment(null);
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  drop(dropRef);

  const renderDropIndicators = () => {
    if (!isOver || !activeSegment || !dropRef.current) return null;

    const container = dropRef.current;
    const rect = container.getBoundingClientRect();
    const components = container.querySelectorAll('.form-component');

    if (activeSegment.type === 'between') {
      let indicatorTop = 0;
      
      if (activeSegment.index === 0 && components.length > 0) {
        // Before first component
        const firstComp = components[0] as HTMLElement;
        const firstRect = firstComp.getBoundingClientRect();
        indicatorTop = firstRect.top - rect.top - 10;
      } else if (activeSegment.index >= components.length) {
        // After last component
        const lastComp = components[components.length - 1] as HTMLElement;
        const lastRect = lastComp.getBoundingClientRect();
        indicatorTop = lastRect.bottom - rect.top + 10;
      } else {
        // Between components
        const prevComp = components[activeSegment.index - 1] as HTMLElement;
        const nextComp = components[activeSegment.index] as HTMLElement;
        const prevRect = prevComp.getBoundingClientRect();
        const nextRect = nextComp.getBoundingClientRect();
        indicatorTop = (prevRect.bottom + nextRect.top) / 2 - rect.top;
      }

      return (
        <div
          className="drop-indicator-between"
          style={{
            position: 'absolute',
            top: `${indicatorTop}px`,
            left: '0',
            right: '0',
            height: '4px',
            backgroundColor: 'var(--color-primary-500)',
            borderRadius: '2px',
            zIndex: 1000,
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.7)',
            animation: 'dropIndicatorPulse 1s infinite alternate'
          }}
        />
      );
    } else if (activeSegment.type === 'left' || activeSegment.type === 'right') {
      const targetComponent = container.querySelector(`[data-component-id="${activeSegment.targetId}"]`) as HTMLElement;
      if (!targetComponent) return null;

      const compRect = targetComponent.getBoundingClientRect();
      const indicatorLeft = activeSegment.type === 'left' 
        ? compRect.left - rect.left - 4
        : compRect.right - rect.left;

      return (
        <div
          className="drop-indicator-horizontal"
          style={{
            position: 'absolute',
            top: `${compRect.top - rect.top}px`,
            left: `${indicatorLeft}px`,
            width: '4px',
            height: `${compRect.height}px`,
            backgroundColor: 'var(--color-primary-500)',
            borderRadius: '2px',
            zIndex: 1000,
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.7)',
            animation: 'dropIndicatorPulse 1s infinite alternate'
          }}
        />
      );
    }

    return null;
  };

  const renderDropLabel = () => {
    if (!isOver || !activeSegment) return null;

    let labelText = '';
    let labelClass = 'drop-label';

    if (activeSegment.type === 'between') {
      labelText = activeSegment.index === 0 ? 'Insert at beginning' :
                  activeSegment.index >= componentCount ? 'Insert at end' :
                  `Insert between items ${activeSegment.index} and ${activeSegment.index + 1}`;
    } else if (activeSegment.type === 'left') {
      labelText = 'Insert to the left (side by side)';
    } else if (activeSegment.type === 'right') {
      labelText = 'Insert to the right (side by side)';
    }

    return (
      <div
        className={labelClass}
        style={{
          position: 'fixed',
          left: `${mousePosition.x + 10}px`,
          top: `${mousePosition.y - 30}px`,
          backgroundColor: 'var(--color-primary-600)',
          color: 'white',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          zIndex: 2000,
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-lg)',
          pointerEvents: 'none'
        }}
      >
        {labelText}
      </div>
    );
  };

  return (
    <div
      ref={dropRef}
      className={`survey-drop-zone ${isOver ? 'is-drop-active' : ''}`}
      style={{ position: 'relative', minHeight: '100px' }}
    >
      {renderDropIndicators()}
      {renderDropLabel()}
      {children}
    </div>
  );
};

export default SurveyDropZone;