import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { XYCoord } from 'react-dnd';
import SmartDropZone from '../molecules/dropzones/SmartDropZone';
import ComponentPreview from '../molecules/utils/ComponentPreview';
import type { FormComponentData, ComponentType, DraggableComponentProps } from '../types';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  index,
  isSelected,
  onSelect,
  onDelete,
  onMove,
  onInsertWithPosition,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: 'form-component',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'form-component',
    item: () => {
      return { id: component.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(component.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(component.id);
  };

  const handleDropWithPosition = (type: ComponentType, targetId: string, position: 'left' | 'right' | 'top' | 'bottom') => {
    if (onInsertWithPosition) {
      onInsertWithPosition(type, targetId, position);
    }
  };

  const componentClasses = [
    'form-component',
    'draggable-component',
    isSelected ? 'form-component--selected' : '',
    isDragging ? 'form-component--dragging' : '',
  ].filter(Boolean).join(' ');

  const componentContent = (
    <div
      ref={ref}
      className={componentClasses}
      onClick={handleClick}
      style={{ opacity }}
      data-handler-id={handlerId}
      data-component-id={component.id}
    >
      <div className="form-component__content">
        <ComponentPreview component={component} />
      </div>
      
      {isSelected && (
        <div className="form-component__controls">
          <button
            className="form-component__delete-btn"
            onClick={handleDelete}
            title="Delete component"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="form-component__overlay" />
    </div>
  );

  // Wrap with SmartDropZone if the insert function is available
  if (onInsertWithPosition) {
    return (
      <SmartDropZone 
        componentId={component.id}
        onDropWithPosition={handleDropWithPosition}
      >
        {componentContent}
      </SmartDropZone>
    );
  }

  return componentContent;
};

export default DraggableComponent;