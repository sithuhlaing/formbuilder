/**
 * Reusable Drop Zone Components
 * Provides consistent drag-and-drop behavior
 */

import React, { useState, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { classNames } from '../utils';
import type { ComponentType } from '../../types';

interface DragItem {
  type: ComponentType | 'existing-component' | 'component';
  id?: string;
  isFromContainer?: boolean;
  containerPath?: string;
  index?: number;
  componentType?: ComponentType;
}

interface BaseDropZoneProps {
  className?: string;
  children?: React.ReactNode;
  onDrop?: (item: DragItem, position?: string) => void;
  acceptedTypes?: string[];
}

interface BetweenDropZoneProps {
  index: number;
  onInsertBetween: (componentType: ComponentType, insertIndex: number) => void;
  className?: string;
}

interface SmartDropZoneProps extends BaseDropZoneProps {
  onHover?: (isOver: boolean, position?: string) => void;
  calculatePosition?: (clientOffset: { x: number; y: number } | null) => string;
  showPositionIndicators?: boolean;
}

// Basic Drop Zone Component
export const DropZone: React.FC<BaseDropZoneProps> = ({
  className,
  children,
  onDrop,
  acceptedTypes = ['component', 'existing-component']
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: acceptedTypes,
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return;
      onDrop?.(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    drop(node);
  }, [drop]);

  return (
    <div 
      ref={combinedRef}
      className={classNames(
        'drop-zone',
        isOver && 'drop-zone--active',
        className
      )}
    >
      {children}
    </div>
  );
};

// Between Components Drop Zone
export const BetweenDropZone: React.FC<BetweenDropZoneProps> = ({ 
  index, 
  onInsertBetween, 
  className 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ['component'],
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return;
      
      const componentType = item.componentType || item.type;
      
      // Only process actual component types, not drag operation types
      if (componentType && 
          componentType !== 'existing-component' && 
          componentType !== 'component') {
        onInsertBetween(componentType as ComponentType, index);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  });

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    drop(node);
  }, [drop]);

  return (
    <div 
      ref={combinedRef}
      className={classNames(
        'canvas-item__drop-zone',
        isOver && 'canvas-item__drop-zone--active',
        className
      )}
      style={{ 
        height: isOver ? '40px' : '8px',
        margin: '4px 0',
        borderRadius: '4px',
        transition: 'all 0.2s ease'
      }}
      data-testid={`between-drop-zone-${index}`}
    >
      {isOver && (
        <div className="drop-indicator" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: '12px',
          color: '#666',
          fontWeight: 500
        }}>
          Drop here to insert between components
        </div>
      )}
    </div>
  );
};

// Smart Drop Zone with Position Detection
export const SmartDropZone: React.FC<SmartDropZoneProps> = ({
  className,
  children,
  onDrop,
  onHover,
  calculatePosition,
  showPositionIndicators = true,
  acceptedTypes = ['component', 'existing-component']
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dropPosition, setDropPosition] = useState<string>('');
  const [isDropTarget, setIsDropTarget] = useState(false);

  // Default position calculation
  const defaultCalculatePosition = useCallback((clientOffset: { x: number; y: number } | null) => {
    if (!clientOffset) return 'center';
    
    // This would need to be implemented with element ref
    // For now, return center as fallback
    return 'center';
  }, []);

  const [{ isOver }, drop] = useDrop({
    accept: acceptedTypes,
    hover: (_item: DragItem, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const position = (calculatePosition || defaultCalculatePosition)(clientOffset);
      
      setDropPosition(position);
      setIsDropTarget(true);
      onHover?.(true, position);
    },
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return;
      
      const clientOffset = monitor.getClientOffset();
      const position = (calculatePosition || defaultCalculatePosition)(clientOffset);
      
      onDrop?.(item, position);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    drop(node);
  }, [drop]);

  // Reset state when not hovering
  React.useEffect(() => {
    if (!isOver) {
      setDropPosition('');
      setIsDropTarget(false);
      onHover?.(false);
    }
  }, [isOver, onHover]);

  return (
    <div 
      ref={combinedRef}
      className={classNames(
        'smart-drop-zone',
        isDropTarget && 'is-drop-target',
        dropPosition && `hover-${dropPosition}`,
        className
      )}
    >
      {/* Position Indicators */}
      {showPositionIndicators && isDropTarget && (
        <>
          {dropPosition === 'left' && (
            <div className="drop-position-label drop-position-label--left">
              Create Row Layout (Left)
            </div>
          )}
          {dropPosition === 'right' && (
            <div className="drop-position-label drop-position-label--right">
              Create Row Layout (Right)
            </div>
          )}
          {dropPosition === 'before' && (
            <div className="drop-position-label drop-position-label--top">
              Insert Before
            </div>
          )}
          {dropPosition === 'after' && (
            <div className="drop-position-label drop-position-label--bottom">
              Insert After
            </div>
          )}
          {dropPosition === 'center' && (
            <div className="drop-position-label drop-position-label--top">
              Add to End
            </div>
          )}
        </>
      )}
      
      {children}
    </div>
  );
};

// Canvas Drop Zone (for empty canvas)
export const CanvasDropZone: React.FC<{
  isEmpty?: boolean;
  onDrop: (item: DragItem) => void;
  className?: string;
  children?: React.ReactNode;
}> = ({
  isEmpty = false,
  onDrop,
  className,
  children
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ['component', 'existing-component'],
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return;
      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    drop(node);
  }, [drop]);

  return (
    <div 
      ref={combinedRef}
      className={classNames(
        'canvas',
        'survey-drop-zone',
        isOver && 'canvas--drop-hover is-drop-active',
        className
      )}
      data-testid="canvas"
    >
      {isEmpty ? (
        <div className="canvas__empty empty-canvas">
          <div className="empty-canvas__icon">📝</div>
          <h3 className="empty-canvas__title">
            Drag components here to start building your form
          </h3>
          <p className="empty-canvas__description">
            Choose from input fields, selection controls, and layout components in the left panel
          </p>
        </div>
      ) : (
        children
      )}
    </div>
  );
};