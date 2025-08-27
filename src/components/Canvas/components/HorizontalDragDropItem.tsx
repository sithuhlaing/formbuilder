import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import FormComponentRenderer from '../../molecules/forms/FormComponentRenderer';
import type { FormComponentData } from '../../../types';

interface HorizontalDragDropItemProps {
  component: FormComponentData;
  index: number;
  containerPath: string[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onMoveWithinContainer: (dragIndex: number, hoverIndex: number) => void;
  onRemoveFromContainer: (componentId: string) => void;
  onMoveToCanvas: (componentId: string) => void;
  onAddToRow?: (componentType: string, position: 'left' | 'right', targetIndex: number) => void;
}

interface HorizontalDragItem {
  type: string;
  id: string;
  index: number;
  component: FormComponentData;
  containerPath: string[];
}

const HorizontalDragDropItem: React.FC<HorizontalDragDropItemProps> = ({
  component,
  index,
  containerPath,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onMoveWithinContainer,
  onRemoveFromContainer,
  onMoveToCanvas,
  onAddToRow,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<'none' | 'left' | 'right'>('none');

  // Drag functionality for horizontal movement
  const [{ isDragging }, drag] = useDrag({
    type: 'horizontal-component',
    item: (): HorizontalDragItem => ({
      type: 'horizontal-component',
      id: component.id,
      index,
      component,
      containerPath,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop functionality for horizontal reordering and palette components
  const [{ handlerId }, drop] = useDrop({
    accept: ['horizontal-component', 'component'],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }

      // Check if this is a palette component
      const isPaletteComponent = !item.component && item.type && typeof item.type === 'string';
      
      if (isPaletteComponent) {
        // For palette components, show left/right positioning indicators
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) {
          setHoverPosition('none');
          return;
        }

        const x = clientOffset.x - hoverBoundingRect.left;
        const width = hoverBoundingRect.width;
        
        // Simple left/right detection for horizontal layout
        if (x < width / 2) {
          setHoverPosition('left');
        } else {
          setHoverPosition('right');
        }
        return;
      }

      // Handle existing horizontal components
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        setHoverPosition('none');
        return;
      }

      // Check if they're in the same container
      if (item.containerPath.join('/') !== containerPath.join('/')) {
        setHoverPosition('none');
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        setHoverPosition('none');
        return;
      }

      // Get horizontal position relative to the component
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      const hoverMiddleX = hoverBoundingRect.width / 2;

      // Determine drop position (left or right half)
      const position = hoverClientX < hoverMiddleX ? 'left' : 'right';
      setHoverPosition(position);

      // Only perform the move when crossing the middle threshold
      // When dragging rightwards, only move when cursor is past middle
      // When dragging leftwards, only move when cursor is before middle

      // Dragging rightwards
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }

      // Dragging leftwards
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      // Time to actually perform the horizontal reordering
      onMoveWithinContainer(dragIndex, hoverIndex);

      // Mutate the monitor item for performance
      item.index = hoverIndex;
    },
    drop(item: any) {
      const finalPosition = hoverPosition;
      setHoverPosition('none');
      
      // Check if this is a palette component
      const isPaletteComponent = !item.component && item.type && typeof item.type === 'string';
      
      if (isPaletteComponent && onAddToRow) {
        console.log(`🟠 Adding palette component ${item.type} to row at position ${finalPosition} (target index: ${index})`);
        onAddToRow(item.type, finalPosition as 'left' | 'right', index);
      }
    },
  });

  // Combine drag and drop refs
  drag(drop(ref));

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={{
        flex: '1',
        minWidth: '200px',
        opacity,
        position: 'relative',
        transition: 'all 0.2s ease',
        transform: isDragging ? 'rotate(1deg) scale(1.01)' : 'none',
      }}
    >
      {/* Horizontal drop indicators */}
      {hoverPosition === 'left' && (
        <div
          style={{
            position: 'absolute',
            left: '-6px',
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#f59e0b',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)',
            zIndex: 1000,
          }}
        />
      )}

      {hoverPosition === 'right' && (
        <div
          style={{
            position: 'absolute',
            right: '-6px',
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#f59e0b',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)',
            zIndex: 1000,
          }}
        />
      )}

      {/* Component container */}
      <div
        style={{
          padding: '8px',
          border: selectedComponentId === component.id ? '2px solid #10b981' : '1px solid #d1d5db',
          borderRadius: '6px',
          backgroundColor: isDragging ? '#f3f4f6' : '#ffffff',
          boxShadow: selectedComponentId === component.id 
            ? '0 0 0 2px rgba(16, 185, 129, 0.1)' 
            : '0 1px 2px rgba(0, 0, 0, 0.05)',
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
          height: '100%',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent(component.id);
        }}
      >
        {/* Horizontal drag handle */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            width: '16px',
            height: '16px',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#9ca3af',
            opacity: selectedComponentId === component.id ? 1 : 0.3,
            zIndex: 10,
          }}
          title="Drag to reorder horizontally"
        >
          ⋮⋮
        </div>

        {/* Remove from row button */}
        {selectedComponentId === component.id && (
          <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '2px', zIndex: 10 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveToCanvas(component.id);
              }}
              style={{
                width: '16px',
                height: '16px',
                border: 'none',
                borderRadius: '2px',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
              }}
              title="Move to canvas"
            >
              ↗
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromContainer(component.id);
              }}
              style={{
                width: '16px',
                height: '16px',
                border: 'none',
                borderRadius: '2px',
                backgroundColor: '#ef4444',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
              }}
              title="Remove from row"
            >
              ×
            </button>
          </div>
        )}

        {/* Component content */}
        <div style={{ marginTop: '20px', marginRight: selectedComponentId === component.id ? '40px' : '8px' }}>
          <FormComponentRenderer
            component={component}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            onUpdateComponent={onUpdateComponent}
            containerPath={containerPath}
            isInContainer={true}
          />
        </div>
      </div>
    </div>
  );
};

export default HorizontalDragDropItem;