import React, { useState, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import type { DropTargetMonitor } from 'react-dnd';
import type { ComponentType } from '../../types';

interface SurveyDropZoneProps {
  children: React.ReactNode;
  onInsertBetween: (type: ComponentType, index: number) => void;
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

    // Get all form components and groups in the container
    const elements = container.querySelectorAll('.form-component, .component-group');
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      const elementRect = element.getBoundingClientRect();
      const elementRelativeTop = elementRect.top - rect.top;
      const elementRelativeBottom = elementRect.bottom - rect.top;
      const elementRelativeLeft = elementRect.left - rect.left;
      const elementRelativeRight = elementRect.right - rect.left;

      // Check if hovering over this element
      if (relativeY >= elementRelativeTop && relativeY <= elementRelativeBottom) {
        const elementId = element.getAttribute('data-component-id') || element.getAttribute('data-group-id');
        
        // Check horizontal segments (left/right of element)
        const horizontalThreshold = elementRect.width * 0.25; // 25% from edges
        
        if (relativeX >= elementRelativeLeft && relativeX <= elementRelativeLeft + horizontalThreshold) {
          // Left side of element
          return {
            type: 'left',
            index: i,
            targetId: elementId || undefined
          };
        } else if (relativeX >= elementRelativeRight - horizontalThreshold && relativeX <= elementRelativeRight) {
          // Right side of element  
          return {
            type: 'right',
            index: i,
            targetId: elementId || undefined
          };
        }
      }

      // Check between segments (vertical gaps between elements)
      if (i < elements.length - 1) {
        const nextElement = elements[i + 1] as HTMLElement;
        const nextRect = nextElement.getBoundingClientRect();
        const gapTop = elementRect.bottom - rect.top;
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
    if (elements.length > 0) {
      const lastElement = elements[elements.length - 1] as HTMLElement;
      const lastRect = lastElement.getBoundingClientRect();
      const lastBottom = lastRect.bottom - rect.top;
      
      if (relativeY > lastBottom) {
        return {
          type: 'between',
          index: elements.length
        };
      }
    }

    // Drop at the beginning if above all elements
    if (elements.length > 0) {
      const firstElement = elements[0] as HTMLElement;
      const firstRect = firstElement.getBoundingClientRect();
      const firstTop = firstRect.top - rect.top;
      
      if (relativeY < firstTop) {
        return {
          type: 'between',
          index: 0
        };
      }
    }

    // Default to end if no elements
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
    const elements = container.querySelectorAll('.form-component, .component-group');

    if (activeSegment.type === 'between') {
      let indicatorTop = 0;
      
      if (activeSegment.index === 0 && elements.length > 0) {
        // Before first element
        const firstEl = elements[0] as HTMLElement;
        if (firstEl) {
          const firstRect = firstEl.getBoundingClientRect();
          indicatorTop = firstRect.top - rect.top - 10;
        }
      } else if (activeSegment.index >= elements.length && elements.length > 0) {
        // After last element
        const lastEl = elements[elements.length - 1] as HTMLElement;
        if (lastEl) {
          const lastRect = lastEl.getBoundingClientRect();
          indicatorTop = lastRect.bottom - rect.top + 10;
        }
      } else if (activeSegment.index > 0 && activeSegment.index < elements.length) {
        // Between elements
        const prevEl = elements[activeSegment.index - 1] as HTMLElement;
        const nextEl = elements[activeSegment.index] as HTMLElement;
        if (prevEl && nextEl) {
          const prevRect = prevEl.getBoundingClientRect();
          const nextRect = nextEl.getBoundingClientRect();
          indicatorTop = (prevRect.bottom + nextRect.top) / 2 - rect.top;
        }
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
      const targetElement = container.querySelector(`[data-component-id="${activeSegment.targetId}"], [data-group-id="${activeSegment.targetId}"]`) as HTMLElement;
      if (!targetElement) return null;

      const elRect = targetElement.getBoundingClientRect();
      const indicatorLeft = activeSegment.type === 'left' 
        ? elRect.left - rect.left - 4
        : elRect.right - rect.left;

      return (
        <div
          className="drop-indicator-horizontal"
          style={{
            position: 'absolute',
            top: `${elRect.top - rect.top}px`,
            left: `${indicatorLeft}px`,
            width: '4px',
            height: `${elRect.height}px`,
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

    // Fallback label if something went wrong
    if (!labelText) {
      labelText = 'Drop component here';
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