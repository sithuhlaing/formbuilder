
import React from 'react';
import ComponentGroup from './ComponentGroup';
import ComponentItem from './ComponentItem';
import CanvasEmptyState from '../atoms/layout/CanvasEmptyState';
import { useComponentGrouping } from '../../hooks/useComponentGrouping';
import type { FormComponentData, CanvasProps } from '../types';

interface CanvasContentProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: CanvasProps['onSelectComponent'];
  onDeleteComponent: CanvasProps['onDeleteComponent'];
  onMoveComponent: CanvasProps['onMoveComponent'];
  onInsertWithPosition?: CanvasProps['onInsertWithPosition'];
}

const CanvasContent: React.FC<CanvasContentProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onMoveComponent,
  onInsertWithPosition,
}) => {
  const { createOrderedItems } = useComponentGrouping(components);

  if (components.length === 0) {
    return <CanvasEmptyState />;
  }

  const orderedItems = createOrderedItems();

  return (
    <div className="canvas-content">
      {orderedItems.map((item, index) => {
        if (item.type === 'component') {
          const component = item.data as FormComponentData;
          return (
            <ComponentItem
              key={component.id}
              component={component}
              index={index}
              selectedComponentId={selectedComponentId}
              onSelectComponent={onSelectComponent}
              onDeleteComponent={onDeleteComponent}
              onMoveComponent={onMoveComponent}
              onInsertWithPosition={onInsertWithPosition}
            />
          );
        } else {
          const groupData = item.data as { groupId: string; components: FormComponentData[] };
          return (
            <ComponentGroup
              key={groupData.groupId}
              group={groupData.components}
              groupId={groupData.groupId}
              index={index}
              selectedComponentId={selectedComponentId}
              onSelectComponent={onSelectComponent}
              onDeleteComponent={onDeleteComponent}
              onMoveComponent={onMoveComponent}
              onInsertWithPosition={onInsertWithPosition}
            />
          );
        }
      })}
    </div>
  );
};

export default CanvasContent;
