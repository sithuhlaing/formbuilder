
import React from 'react';
import { useDrop, useDrag } from 'react-dnd';
import FormComponentRenderer from '../forms/FormComponentRenderer';

interface LayoutColumnProps {
  column: LayoutColumn;
  rowIndex: number;
  columnIndex: number;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (componentId: string) => void;
  onUpdateComponent: (componentId: string, updates: Partial<FormComponentData>) => void;
  onAddToColumn: (componentType: ComponentType, rowIndex: number, columnIndex: number) => void;
  onDeleteColumn: (rowIndex: number, columnIndex: number) => void;
}

const LayoutColumn: React.FC<LayoutColumnProps> = ({
  column,
  rowIndex,
  columnIndex,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onUpdateComponent,
  onAddToColumn,
  onDeleteColumn
}) => {
  const [{ isOver }, drop] = useDrop<
    { type: ComponentType; id?: string },
    void,
    { isOver: boolean }
  >({
    accept: ['component', 'existing-component'],
    drop: (item) => {
      if (item.id) {
        // Handle moving existing component
        console.log('Moving existing component:', item.id);
      } else {
        // Handle adding new component
        onAddToColumn(item.type, rowIndex, columnIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div
      ref={drop}
      className={`layout-column ${isOver ? 'is-drop-target' : ''}`}
      style={{
        flex: `0 0 ${column.width}%`,
        minHeight: '100px',
        padding: '8px',
        border: isOver ? '2px dashed #8b5cf6' : '1px solid #d1d5db',
        borderRadius: '4px',
        backgroundColor: isOver ? '#f3e8ff' : '#f9fafb',
        position: 'relative',
      }}
    >
      {/* Column controls */}
      <div className="layout-column__controls">
        <button
          onClick={() => onDeleteColumn(rowIndex, columnIndex)}
          className="layout-control-btn layout-control-btn--danger"
          title="Delete column"
        >
          ✕
        </button>
      </div>

      {/* Components */}
      <div className="layout-column__components">
        {column.components.length === 0 ? (
          <div className="layout-column__empty">
            <span>Drop components here</span>
          </div>
        ) : (
          column.components.map((component, componentIndex) => (
            <DraggableComponent
              key={component.id}
              component={component}
              componentIndex={componentIndex}
              rowIndex={rowIndex}
              columnIndex={columnIndex}
              isSelected={selectedComponentId === component.id}
              onSelect={onSelectComponent}
              onDelete={onDeleteComponent}
              onUpdate={onUpdateComponent}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LayoutColumn;
