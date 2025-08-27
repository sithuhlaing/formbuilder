
import React from 'react';
import { useDrop } from 'react-dnd';
import LayoutColumn from './LayoutColumn';

interface LayoutRowProps {
  row: LayoutRow;
  rowIndex: number;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (componentId: string) => void;
  onUpdateComponent: (componentId: string, updates: Partial<FormComponentData>) => void;
  onAddColumn: (componentType: ComponentType, rowIndex: number) => void;
  onAddToColumn: (componentType: ComponentType, rowIndex: number, columnIndex: number) => void;
  onDeleteRow: (rowIndex: number) => void;
  onDeleteColumn: (rowIndex: number, columnIndex: number) => void;
}

const LayoutRow: React.FC<LayoutRowProps> = ({
  row,
  rowIndex,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onUpdateComponent,
  onAddColumn,
  onAddToColumn,
  onDeleteRow,
  onDeleteColumn
}) => {
  const [{ isOver }, drop] = useDrop<
    { type: ComponentType },
    void,
    { isOver: boolean }
  >({
    accept: ['component'],
    drop: (item) => {
      onAddColumn(item.type, rowIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div
      ref={drop}
      className={`layout-row ${isOver ? 'is-drop-target' : ''}`}
      style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        padding: '8px',
        border: isOver ? '2px dashed #10b981' : '1px solid #e5e7eb',
        borderRadius: '6px',
        backgroundColor: isOver ? '#ecfdf5' : '#ffffff',
        position: 'relative',
      }}
    >
      {/* Row controls */}
      <div className="layout-row__controls">
        <button
          onClick={() => onDeleteRow(rowIndex)}
          className="layout-control-btn layout-control-btn--danger"
          title="Delete row"
        >
          🗑️
        </button>
      </div>

      {/* Columns */}
      <div className="layout-row__columns" style={{ display: 'flex', flex: 1, gap: '8px' }}>
        {row.columns.map((column, columnIndex) => (
          <LayoutColumn
            key={column.id}
            column={column}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            onDeleteComponent={onDeleteComponent}
            onUpdateComponent={onUpdateComponent}
            onAddToColumn={onAddToColumn}
            onDeleteColumn={onDeleteColumn}
          />
        ))}
      </div>
    </div>
  );
};

export default LayoutRow;
