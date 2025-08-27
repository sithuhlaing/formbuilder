
import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import FormComponentRenderer from '../forms/FormComponentRenderer';
import LayoutContainer from './LayoutContainer';

interface DraggableFormComponentProps {
  component: FormComponentData;
  index: number;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onDelete: (componentId: string) => void;
  onUpdate: (componentId: string, updates: Partial<FormComponentData>) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onInsert: (componentType: ComponentType, targetId: string, position: 'before' | 'after' | 'inside') => void;
}

const DraggableFormComponent: React.FC<DraggableFormComponentProps> = ({
  component,
  index,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onMove,
  onInsert
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dropZone, setDropZone] = useState<'before' | 'after' | 'inside' | null>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'existing-component',
    item: { id: component.id, index, type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ['component', 'existing-component'],
    hover: (item: any, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Determine drop zone
      if (hoverClientY < hoverMiddleY * 0.3) {
        setDropZone('before');
      } else if (hoverClientY > hoverMiddleY * 1.7) {
        setDropZone('after');
      } else if (component.type === 'horizontal_layout' || component.type === 'vertical_layout') {
        setDropZone('inside');
      } else {
        setDropZone('after');
      }

      // Only perform the move when dragging existing components
      if (item.type === 'existing-component' && dragIndex !== undefined) {
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    drop: (item: any) => {
      if (item.type !== 'existing-component') {
        onInsert(item.type, component.id, dropZone || 'after');
      }
      setDropZone(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  React.useEffect(() => {
    if (!isOver) {
      setDropZone(null);
    }
  }, [isOver]);

  drag(drop(ref));

  const isLayoutContainer = component.type === 'horizontal_layout' || component.type === 'vertical_layout';

  return (
    <div
      ref={ref}
      className={`component-wrapper ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${dropZone ? 'drop-target' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
      }}
    >
      {/* Drop zone indicators */}
      {dropZone === 'before' && (
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: '#10b981',
          borderRadius: '2px',
          zIndex: 10,
        }} />
      )}
      {dropZone === 'after' && (
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: '#10b981',
          borderRadius: '2px',
          zIndex: 10,
        }} />
      )}
      {dropZone === 'inside' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '4px 8px',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 10,
        }}>
          Drop inside
        </div>
      )}

      {/* Component controls */}
      {isSelected && (
        <div className="component-controls">
          <button
            className="component-control-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
            title="Delete component"
          >
            ×
          </button>
        </div>
      )}

      {/* Render the component */}
      {isLayoutContainer ? (
        <LayoutContainer
          component={component}
          onInsert={onInsert}
          onSelect={onSelect}
          onDelete={onDelete}
          onUpdate={onUpdate}
          selectedComponentId={isSelected ? component.id : null}
        />
      ) : (
        <FormComponentRenderer
          component={component}
          onChange={(value) => onUpdate(component.id, { value })}
        />
      )}
    </div>
  );
};

export default DraggableFormComponent;
