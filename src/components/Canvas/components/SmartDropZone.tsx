import React, { useState, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import DropIndicator from './DropIndicator';
import { positionDetector } from '../utils/positionDetector';
import type { SmartDropZoneProps } from '../types/positioning';
import type { DragItem } from '../types';

const SmartDropZone: React.FC<SmartDropZoneProps> = ({
  componentId,
  componentIndex,
  elementRef,
  onDrop,
  children
}) => {
  const [activePosition, setActivePosition] = useState<'top' | 'right' | 'bottom' | 'left' | 'center' | null>(null);
  const [indicatorBounds, setIndicatorBounds] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleHover = useCallback((item: DragItem, monitor: any) => {
    if (!elementRef.current) return;

    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) {
      setActivePosition(null);
      setIndicatorBounds(null);
      return;
    }

    const regions = positionDetector.calculateCrossSectionRegions(elementRef.current);
    const position = positionDetector.detectDropPosition(clientOffset.x, clientOffset.y, regions);
    
    setActivePosition(position);
    setIndicatorBounds(
      positionDetector.getIndicatorBounds(position, elementRef.current.getBoundingClientRect())
    );
  }, [elementRef]);

  const handleDrop = useCallback((item: DragItem, monitor: any) => {
    console.log('SmartDropZone handleDrop:', { item, activePosition, componentId, componentIndex });
    if (!elementRef.current || !activePosition) {
      console.log('SmartDropZone: No element or position');
      return;
    }

    // Handle both new components from palette AND existing component rearrangement
    let componentType: string;
    
    if (item.id) {
      // This is an existing component being rearranged
      componentType = item.type; // For existing components, type is the component type
      console.log('SmartDropZone: Handling existing component rearrangement:', item);
    } else {
      // This is a new component from palette
      componentType = item.type;
      console.log('SmartDropZone: Handling new component from palette:', item);
    }

    // Validate that we have a valid component type
    if (!componentType || typeof componentType !== 'string') {
      console.log('SmartDropZone: Invalid component type:', item);
      return;
    }

    // Determine if target component is in a row layout
    const isTargetInRow = false; // This would be determined by checking parent component type

    const result = positionDetector.calculatePositioningResult(
      activePosition,
      componentIndex,
      componentId,
      isTargetInRow
    );

    // Add the component type to the result
    (result as any).componentType = componentType;
    
    // Only add source info for rearrangement (existing components with id)
    if (item.id) {
      (result as any).sourceComponentId = item.id; // For rearrangement, this will be the component being moved
      (result as any).sourceIndex = item.index; // For rearrangement, this will be the original position
      console.log('SmartDropZone: Adding rearrangement data to result');
    } else {
      console.log('SmartDropZone: New component from palette - no source data added');
    }

    console.log('SmartDropZone: Calling onDrop with result:', result);
    onDrop(result);
    
    // Reset indicators
    setActivePosition(null);
    setIndicatorBounds(null);
  }, [activePosition, componentIndex, componentId, elementRef, onDrop]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['component', 'existing-component', 'nested-component'],
    hover: handleHover,
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  }));

  drop(containerRef);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {children}
      
      {/* Drop Indicators */}
      {isOver && canDrop && activePosition && indicatorBounds && (
        <DropIndicator
          position={activePosition}
          isVisible={true}
          bounds={indicatorBounds}
          containerRef={containerRef}
        />
      )}
    </div>
  );
};

export default SmartDropZone;