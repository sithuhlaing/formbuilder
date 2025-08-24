import React from 'react';
import DraggableComponent from '../../organisms/DraggableComponent';
import type { FormComponentData, CanvasProps } from '../../types';

interface ComponentItemProps {
  component: FormComponentData;
  index: number;
  selectedComponentId: string | null;
  onSelectComponent: CanvasProps['onSelectComponent'];
  onDeleteComponent: CanvasProps['onDeleteComponent'];
  onMoveComponent: CanvasProps['onMoveComponent'];
  onInsertWithPosition?: CanvasProps['onInsertWithPosition'];
}

const ComponentItem: React.FC<ComponentItemProps> = ({
  component,
  index,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onMoveComponent,
  onInsertWithPosition,
}) => {
  return (
    <DraggableComponent
      component={component}
      index={index}
      isSelected={selectedComponentId === component.id}
      onSelect={onSelectComponent}
      onDelete={onDeleteComponent}
      onMove={onMoveComponent}
      onInsertWithPosition={onInsertWithPosition}
    />
  );
};

export default ComponentItem;