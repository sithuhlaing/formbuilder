
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import type { FormComponentData } from '../../../types';
import type { DragItem } from '../../Canvas/types';
import ComponentRenderer from '../utils/ComponentRenderer';

interface FormComponentRendererProps {
  component: FormComponentData;
  index: number;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onDropComponent: (item: DragItem, index: number) => void;
  onSelectComponent: (component: FormComponentData) => void;
  onDeleteComponent: (id: string) => void;
  selectedComponentId?: string | null;
  onDropInContainer?: (item: DragItem, containerId: string) => void;
  onDropInContainerWithPosition?: (item: DragItem, containerId: string, position: 'left' | 'right' | 'center') => void;
  onRearrangeWithinContainer?: (dragIndex: number, hoverIndex: number, containerId: string) => void;
  isInContainer?: boolean;
  containerId?: string;
  containerPath?: string[];
  onRemoveFromContainer?: (componentId: string, containerPath: string[]) => void;
  onMoveToCanvas?: (componentId: string, containerPath: string[], index: number) => void;
  handleMoveToContainer?: (componentId: string, fromPath: string[], toPath: string[], position?: 'left' | 'right' | 'center') => void;
  onUpdateComponent?: (id: string, updates: Partial<FormComponentData>) => void;
  onInsertComponent?: (componentType: string, containerId: string, position: 'left' | 'right' | 'center') => void;
}

const FormComponentRenderer: React.FC<FormComponentRendererProps> = (props) => {
  const {
    component,
    index,
    onMoveComponent,
    onDropComponent,
    onSelectComponent,
    onDeleteComponent,
    selectedComponentId,
    isInContainer,
    containerId,
    onRearrangeWithinContainer,
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const isSelected = selectedComponentId === component.id;

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ['sidebar-component', 'component'],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    drop: (item: DragItem) => {
      if (item.type && !item.id) { // New component from sidebar
        onDropComponent(item, index);
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }

      // Don't perform hover logic for new components from the sidebar
      if (item.index === undefined) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex && item.containerId === containerId) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      if (isInContainer && containerId && onRearrangeWithinContainer) {
        if (item.containerId === containerId) {
          onRearrangeWithinContainer(dragIndex, hoverIndex, containerId);
        }
      } else if (!isInContainer && onMoveComponent) {
        onMoveComponent(dragIndex, hoverIndex);
      }

      item.index = hoverIndex;
      if (isInContainer) {
        item.containerId = containerId;
      } else {
        item.containerId = undefined;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: () => {
      return { 
        id: component.id, 
        index, 
        type: component.type,
        isInContainer,
        containerPath: props.containerPath,
        containerId,
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectComponent(component);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteComponent(component.id);
  };

  const wrapperStyle: React.CSSProperties = {
    padding: '4px',
    marginBottom: '8px',
    cursor: 'move',
    opacity: isDragging ? 0.4 : 1,
    border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
    borderRadius: '10px',
    position: 'relative',
    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  };

  return (
    <div
      ref={ref}
      style={wrapperStyle}
      onClick={handleClick}
      data-handler-id={handlerId}
    >
      <ComponentRenderer {...props} />

      {isSelected && !isInContainer && (
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', zIndex: 10 }}>
          <button
            onClick={handleDelete}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
            aria-label="Delete component"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default FormComponentRenderer;
