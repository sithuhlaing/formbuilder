/**
 * PHASE 3: Drag-Drop Handlers Implementation
 * React DnD integration for the layout engine
 */

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import type { Component, ComponentType } from '../types/components';
import { LayoutEngine, DropPosition, DragType, type DragData } from './layoutEngine';

// Props for draggable components
export interface DraggableComponentProps {
  component: Component;
  index: number;
  isDragging?: boolean;
  onMove?: (draggedItem: any, targetIndex: number) => void;
  onSelect?: (component: Component) => void;
  children: React.ReactNode;
}

// Props for droppable zones
export interface DroppableZoneProps {
  component: Component;
  index: number;
  onDrop: (item: any, position: DropPosition) => void;
  children: React.ReactNode;
  isOver?: boolean;
  canDrop?: boolean;
}

// Custom drag layer for visual feedback
export interface DragLayerProps {
  item: any;
  itemType: string;
  currentOffset?: { x: number; y: number };
  isDragging: boolean;
}

/**
 * Hook for making components draggable
 */
export function useDraggableComponent(props: DraggableComponentProps) {
  const { component, index, onMove, onSelect } = props;
  
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: component.type === 'horizontal_layout' ? 'ROW_LAYOUT' : 'COMPONENT',
    item: () => ({
      id: component.id,
      type: component.type,
      component: component,
      index: index,
      isRowLayout: component.type === 'horizontal_layout'
    }),
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    begin: () => {
      // Select component when drag starts
      onSelect?.(component);
    },
    end: (item: any, monitor: DragSourceMonitor) => {
      if (!monitor.didDrop()) {
        return;
      }
      
      const dropResult = monitor.getDropResult();
      if (dropResult && onMove) {
        onMove(item, dropResult.targetIndex);
      }
    },
  });

  return {
    isDragging,
    drag,
    dragPreview,
    opacity: isDragging ? 0.5 : 1,
  };
}

/**
 * Hook for making drop zones
 */
export function useDroppableZone(props: DroppableZoneProps) {
  const { component, index, onDrop } = props;
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['COMPONENT', 'ROW_LAYOUT', 'NEW_COMPONENT'],
    drop: (item: any, monitor: DropTargetMonitor) => {
      const clientOffset = monitor.getClientOffset();
      const targetRect = monitor.getSourceClientOffset();
      
      if (!clientOffset || !targetRect) {
        return;
      }
      
      // Calculate drop position based on mouse coordinates
      const dropPosition = LayoutEngine.calculateDropPosition(
        clientOffset.x,
        clientOffset.y,
        monitor.getSourceClientOffset() as any,
        component
      );
      
      if (dropPosition) {
        onDrop(item, dropPosition);
        return { targetIndex: index, position: dropPosition };
      }
    },
    canDrop: (item: any) => {
      // Validate drop based on item type and target
      if (item.isRowLayout && component.type === 'horizontal_layout') {
        // Cannot drop row inside another row
        return false;
      }
      
      if (item.isRowLayout && (component.type === 'horizontal_layout' && item.component?.children?.some((child: Component) => child.id === component.id))) {
        // Cannot drop row inside its own children
        return false;
      }
      
      return true;
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return {
    isOver,
    canDrop,
    drop,
    isActive: isOver && canDrop,
  };
}

/**
 * Hook for palette items (new components)
 */
export function usePaletteDragItem(componentType: ComponentType, label: string) {
  const [{ isDragging }, drag] = useDrag({
    type: 'NEW_COMPONENT',
    item: {
      type: componentType,
      label: label,
      isNew: true,
      componentType: componentType
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return {
    isDragging,
    drag,
    opacity: isDragging ? 0.5 : 1,
  };
}

/**
 * Custom drag layer for visual feedback
 */
export const DragLayer: React.FC<DragLayerProps> = ({ item, itemType, currentOffset, isDragging }) => {
  if (!isDragging || !currentOffset) {
    return null;
  }

  const layerStyles: React.CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 1000,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  };

  const getItemStyles = (currentOffset: { x: number; y: number }): React.CSSProperties => {
    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;
    
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      transform,
      WebkitTransform: transform,
      opacity: 0.8,
      border: '2px dashed #007bff',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      padding: '8px',
      borderRadius: '4px',
    };
  };

  const renderItem = () => {
    switch (itemType) {
      case 'COMPONENT':
        return (
          <div style={getItemStyles(currentOffset)}>
            <strong>{item.component?.label || item.label}</strong>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {item.component?.type || item.type}
            </div>
          </div>
        );
      
      case 'ROW_LAYOUT':
        return (
          <div style={getItemStyles(currentOffset)}>
            <strong>Row Layout</strong>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {item.component?.children?.length || 0} components
            </div>
          </div>
        );
      
      case 'NEW_COMPONENT':
        return (
          <div style={getItemStyles(currentOffset)}>
            <strong>{item.label}</strong>
            <div style={{ fontSize: '12px', color: '#666' }}>
              New Component
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(currentOffset)}>
        {renderItem()}
      </div>
    </div>
  );
};

/**
 * Drop indicator component
 */
export const DropIndicator: React.FC<{
  position: DropPosition;
  targetRect: DOMRect;
  isValid: boolean;
}> = ({ position, targetRect, isValid }) => {
  const indicatorStyles: React.CSSProperties = {
    position: 'fixed',
    backgroundColor: isValid ? '#007bff' : '#dc3545',
    zIndex: 999,
    pointerEvents: 'none',
  };

  let specificStyles: React.CSSProperties = {};

  switch (position) {
    case DropPosition.BEFORE:
      specificStyles = {
        top: `${targetRect.top - 2}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: '4px',
      };
      break;

    case DropPosition.AFTER:
      specificStyles = {
        top: `${targetRect.bottom - 2}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: '4px',
      };
      break;

    case DropPosition.LEFT:
      specificStyles = {
        top: `${targetRect.top}px`,
        left: `${targetRect.left - 2}px`,
        width: '4px',
        height: `${targetRect.height}px`,
      };
      break;

    case DropPosition.RIGHT:
      specificStyles = {
        top: `${targetRect.top}px`,
        left: `${targetRect.right - 2}px`,
        width: '4px',
        height: `${targetRect.height}px`,
      };
      break;

    default:
      return null;
  }

  return (
    <div style={{ ...indicatorStyles, ...specificStyles }} />
  );
};

/**
 * Main drag-drop context provider
 */
export interface DragDropContextProps {
  children: React.ReactNode;
  onDrop: (dragData: DragData, targetComponent: Component, dropPosition: DropPosition) => void;
  components: Component[];
  selectedId?: string;
  onSelect?: (component: Component) => void;
}

export const DragDropContext: React.FC<DragDropContextProps> = ({
  children,
  onDrop,
  components,
  selectedId,
  onSelect
}) => {
  const [draggedItem, setDraggedItem] = React.useState<any>(null);
  const [dropIndicator, setDropIndicator] = React.useState<{
    position: DropPosition;
    targetRect: DOMRect;
    isValid: boolean;
  } | null>(null);

  const handleDrop = React.useCallback((
    item: any,
    targetComponent: Component,
    dropPosition: DropPosition
  ) => {
    try {
      // Create drag data
      const dragData: DragData = item.isNew 
        ? LayoutEngine.createDragData('palette', { type: item.componentType })
        : LayoutEngine.createDragData('canvas', item.component);

      // Call the provided drop handler
      onDrop(dragData, targetComponent, dropPosition);
      
      // Clear indicators
      setDropIndicator(null);
      setDraggedItem(null);
    } catch (error) {
      console.error('Drop failed:', error);
      // Could show error toast here
    }
  }, [onDrop]);

  const handleHover = React.useCallback((
    item: any,
    targetComponent: Component,
    targetElement: HTMLElement
  ) => {
    if (!item) {
      setDropIndicator(null);
      return;
    }

    // Calculate drop position
    const dropPosition = LayoutEngine.calculateDropPosition(
      0, // Will be updated with actual mouse position
      0,
      targetElement,
      targetComponent
    );

    if (dropPosition) {
      const rect = targetElement.getBoundingClientRect();
      setDropIndicator({
        position: dropPosition,
        targetRect: rect,
        isValid: true
      });
    } else {
      setDropIndicator(null);
    }
  }, []);

  const contextValue = React.useMemo(() => ({
    draggedItem,
    dropIndicator,
    handleDrop,
    handleHover,
    selectedId,
    onSelect
  }), [draggedItem, dropIndicator, handleDrop, handleHover, selectedId, onSelect]);

  return (
    <div style={{ position: 'relative' }}>
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child as React.ReactElement, { context: contextValue })
          : child
      )}
      
      {dropIndicator && (
        <DropIndicator
          position={dropIndicator.position}
          targetRect={dropIndicator.targetRect}
          isValid={dropIndicator.isValid}
        />
      )}
    </div>
  );
};

/**
 * Higher-order component for making components draggable
 */
export function withDragDrop<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return React.forwardRef<any, P>((props, ref) => {
    return <WrappedComponent {...props} ref={ref} />;
  });
}

/**
 * Utility functions for drag-drop operations
 */
export const DragDropUtils = {
  /**
   * Check if a component can be dropped at a position
   */
  canDropAt: (
    item: any,
    targetComponent: Component,
    position: DropPosition
  ): boolean => {
    // Row layout restrictions
    if (item.isRowLayout) {
      if (position === DropPosition.LEFT || position === DropPosition.RIGHT) {
        return false; // Rows can only move vertically
      }
      
      if (targetComponent.type === 'horizontal_layout') {
        return false; // Cannot drop row inside another row
      }
      
      // Check for circular reference
      if (item.component?.children?.some((child: Component) => child.id === targetComponent.id)) {
        return false;
      }
    }

    return true;
  },

  /**
   * Get drop zone configuration for component type
   */
  getDropZoneConfig: (componentType: ComponentType) => {
    if (componentType === 'horizontal_layout') {
      return {
        horizontalEdge: 0.2,
        verticalEdge: 0.3,
        centerBlocked: true
      };
    }

    return {
      horizontalEdge: 0.2,
      verticalEdge: 0.3,
      centerBlocked: false
    };
  },

  /**
   * Create drag preview element
   */
  createDragPreview: (component: Component): HTMLElement => {
    const preview = document.createElement('div');
    preview.style.padding = '8px';
    preview.style.border = '2px dashed #007bff';
    preview.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
    preview.style.borderRadius = '4px';
    preview.style.fontSize = '14px';
    preview.innerHTML = `
      <div style="font-weight: bold;">${component.label}</div>
      <div style="font-size: 12px; color: #666;">${component.type}</div>
    `;
    
    document.body.appendChild(preview);
    return preview;
  }
};

export default {
  useDraggableComponent,
  useDroppableZone,
  usePaletteDragItem,
  DragLayer,
  DropIndicator,
  DragDropContext,
  withDragDrop,
  DragDropUtils
};
