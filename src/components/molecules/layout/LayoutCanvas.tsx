
import React from 'react';
import { useDrop } from 'react-dnd';
import DraggableFormComponent from './DraggableFormComponent';
import type { FormComponentData, ComponentType } from '../../types';

interface LayoutCanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (componentId: string) => void;
  onUpdateComponent: (componentId: string, updates: Partial<FormComponentData>) => void;
  onAddComponent: (componentType: ComponentType) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onInsertComponent: (componentType: ComponentType, targetId: string, position: 'before' | 'after' | 'inside') => void;
}

const LayoutCanvas: React.FC<LayoutCanvasProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onUpdateComponent,
  onAddComponent,
  onMoveComponent,
  onInsertComponent
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ['component'],
    drop: (item: { type: ComponentType }) => {
      onAddComponent(item.type);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const isEmpty = components.length === 0;

  return (
    <div
      ref={drop}
      className={`layout-canvas ${isOver ? 'is-drop-target' : ''} ${isEmpty ? 'is-empty' : ''}`}
      style={{
        flex: 1,
        padding: '16px',
        backgroundColor: isOver ? '#f0f9ff' : '#ffffff',
        border: isOver ? '2px dashed #3b82f6' : '2px dashed transparent',
        borderRadius: '8px',
        minHeight: '400px',
        position: 'relative',
      }}
      onClick={() => onSelectComponent(null)}
    >
      {isEmpty ? (
        <div className="canvas-empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">📝</div>
            <h3>Start Building Your Form</h3>
            <p>Drag components from the sidebar to begin</p>
          </div>
        </div>
      ) : (
        <div className="layout-components">
          {components.map((component, index) => (
            <DraggableFormComponent
              key={component.id}
              component={component}
              index={index}
              isSelected={selectedComponentId === component.id}
              onSelect={onSelectComponent}
              onDelete={onDeleteComponent}
              onUpdate={onUpdateComponent}
              onMove={onMoveComponent}
              onInsert={onInsertComponent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LayoutCanvas;
