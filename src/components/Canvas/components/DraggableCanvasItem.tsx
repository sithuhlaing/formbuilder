import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import FormComponentRenderer from '../../molecules/forms/FormComponentRenderer';
import type { FormComponentData } from '../../../types';
import type { CanvasActions, DragItem } from '../types';
import { ComponentDragDropHandler } from '../handlers/ComponentDragDropHandler';

interface DraggableCanvasItemProps {
  component: FormComponentData;
  index: number;
  selectedComponentId: string | null;
  actions: CanvasActions;
}

const DraggableCanvasItem: React.FC<DraggableCanvasItemProps> = ({
  component,
  index,
  selectedComponentId,
  actions
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const handler = new ComponentDragDropHandler(actions, component, index, itemRef);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'existing-component',
    item: { id: component.id, index, type: component.type } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['existing-component', 'component', 'nested-component'],
    hover: (item: DragItem, monitor) => {
      handler.handleHover(item, monitor);
    },
    drop: (item: DragItem, monitor) => {
      handler.handleDrop(item, monitor);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }));

  drag(drop(itemRef));

  const handleRemoveFromContainer = (componentId: string, containerPath: string[]) => {
    console.log('Removing component from container:', componentId, containerPath);
    actions.onRemoveFromContainer?.(componentId, containerPath);
  };

  const handleMoveFromContainerToCanvas = (componentId: string, containerPath: string[]) => {
    console.log('Moving component from container to canvas:', componentId, containerPath);
    actions.onMoveFromContainerToCanvas?.(componentId, containerPath);
  };

  return (
    <div
      ref={itemRef}
      style={{
        marginBottom: '16px',
        padding: '12px',
        border: selectedComponentId === component.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
        borderColor: isOver && canDrop ? '#10b981' : undefined,
        borderRadius: '6px',
        backgroundColor: isDragging ? '#f3f4f6' : '#ffffff',
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
        boxShadow: selectedComponentId === component.id ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        transform: isDragging ? 'rotate(5deg)' : 'none',
        transition: 'all 0.2s ease',
        ...handler.getDropIndicatorStyle()
      }}
      onClick={() => actions.onSelectComponent(component.id)}
    >
      {/* Drag handle */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          width: '20px',
          height: '20px',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#9ca3af',
          opacity: selectedComponentId === component.id ? 1 : 0.3
        }}
        title="Drag to rearrange"
      >
        ⋮⋮
      </div>

      {selectedComponentId === component.id && (
        <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.onInsertHorizontal?.('text_input', component.id);
            }}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Add component to the right"
          >
            →
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.onDeleteComponent(component.id);
            }}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Delete component"
          >
            ×
          </button>
        </div>
      )}
      
      <div style={{ marginLeft: '24px' }}>
        <FormComponentRenderer 
          component={component}
          selectedComponentId={selectedComponentId}
          onSelectComponent={actions.onSelectComponent}
          onUpdateComponent={actions.onUpdateComponent}
          onRemoveFromContainer={handleRemoveFromContainer}
          onMoveToCanvas={handleMoveFromContainerToCanvas}
          onDropInContainer={actions.onDropInContainer}
          onDropInContainerWithPosition={actions.onDropInContainerWithPosition}
          onRearrangeWithinContainer={actions.onRearrangeWithinContainer}
          onUnwrapRowLayout={actions.onUnwrapRowLayout}
        />
      </div>
    </div>
  );
};

export default DraggableCanvasItem;