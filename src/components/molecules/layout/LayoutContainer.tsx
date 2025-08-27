import React from 'react';
import { useDrop } from 'react-dnd';
import FormComponentRenderer from '../forms/FormComponentRenderer';

interface LayoutContainerProps {
  component: FormComponentData;
  onInsert: (componentType: ComponentType, targetId: string, position: 'before' | 'after' | 'inside') => void;
  onSelect: (id: string | null) => void;
  onDelete: (componentId: string) => void;
  onUpdate: (componentId: string, updates: Partial<FormComponentData>) => void;
  selectedComponentId: string | null;
}

const LayoutContainer: React.FC<LayoutContainerProps> = ({
  component,
  onInsert,
  onSelect,
  onDelete,
  onUpdate,
  selectedComponentId
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ['component'],
    drop: (item: { type: ComponentType }) => {
      onInsert(item.type, component.id, 'inside');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const isHorizontal = component.type === 'horizontal_layout';
  const children = component.children || [];

  return (
    <div
      ref={drop}
      className={`layout-container ${isHorizontal ? 'horizontal' : 'vertical'} ${isOver ? 'drop-target' : ''}`}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: '8px',
        minHeight: '60px',
        padding: '8px',
        border: '2px dashed #d1d5db',
        borderRadius: '6px',
        backgroundColor: isOver ? '#f0f9ff' : '#f9fafb',
        borderColor: isOver ? '#3b82f6' : '#d1d5db',
        position: 'relative',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
    >
      {children.length === 0 ? (
        <div className="layout-container-empty" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40px',
          color: '#6b7280',
          fontSize: '14px',
          fontStyle: 'italic',
          width: '100%',
        }}>
          Drop components here
        </div>
      ) : (
        children.map((child) => (
          <div
            key={child.id}
            style={{
              flex: isHorizontal ? '1' : '0 0 auto',
              minWidth: isHorizontal ? '0' : 'auto',
            }}
          >
            <FormComponentRenderer
              component={child}
              onChange={(value) => onUpdate(child.id, { value })}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default LayoutContainer;