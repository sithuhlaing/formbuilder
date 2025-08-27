
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import FormComponentRenderer from '../forms/FormComponentRenderer';

interface DraggableComponentProps {
  component: FormComponentData;
  componentIndex: number;
  rowIndex: number;
  columnIndex: number;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onDelete: (componentId: string) => void;
  onUpdate: (componentId: string, updates: Partial<FormComponentData>) => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  componentIndex,
  rowIndex,
  columnIndex,
  isSelected,
  onSelect,
  onDelete,
  onUpdate
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'existing-component',
    item: { 
      id: component.id, 
      type: component.type,
      fromRowIndex: rowIndex,
      fromColumnIndex: columnIndex,
      fromComponentIndex: componentIndex
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'existing-component',
    drop: (item: any) => {
      if (item.id !== component.id) {
        // Handle component reordering logic here
        console.log('Reorder components:', item.id, 'to position of', component.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        opacity: isDragging ? 0.5 : 1,
        border: isSelected ? '2px solid blue' : 'none',
        cursor: 'move',
      }}
      onClick={() => onSelect(component.id)}
    >
      <FormComponentRenderer
        component={component}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
};

export default DraggableComponent;
