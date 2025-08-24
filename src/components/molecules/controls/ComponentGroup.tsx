
import React from 'react';
import ComponentItem from './ComponentItem';
import type { FormComponentData, CanvasProps } from '../../types';

interface ComponentGroupProps {
  group: FormComponentData[];
  groupId: string;
  index: number;
  selectedComponentId: string | null;
  onSelectComponent: CanvasProps['onSelectComponent'];
  onDeleteComponent: CanvasProps['onDeleteComponent'];
  onMoveComponent: CanvasProps['onMoveComponent'];
  onInsertWithPosition?: CanvasProps['onInsertWithPosition'];
}

const ComponentGroup: React.FC<ComponentGroupProps> = ({
  group,
  groupId,
  index,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onMoveComponent,
  onInsertWithPosition,
}) => {
  return (
    <div className="component-group" style={{
      display: 'flex',
      gap: 'var(--space-4)',
      padding: 'var(--space-2)',
      border: '1px dashed var(--color-gray-300)',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--color-gray-50)',
      marginBottom: 'var(--space-4)'
    }}>
      <div className="component-group__header" style={{
        position: 'absolute',
        top: '-8px',
        left: '8px',
        backgroundColor: 'var(--color-gray-100)',
        padding: '2px 8px',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-gray-600)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-gray-300)'
      }}>
        Horizontal Group
      </div>
      
      {group.map((component, componentIndex) => (
        <div key={component.id} className="component-group__item" style={{ flex: 1 }}>
          <ComponentItem
            component={component}
            index={componentIndex}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            onDeleteComponent={onDeleteComponent}
            onMoveComponent={onMoveComponent}
            onInsertWithPosition={onInsertWithPosition}
          />
        </div>
      ))}
    </div>
  );
};

export default ComponentGroup;
