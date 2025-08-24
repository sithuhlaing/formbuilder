import React, { useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import SurveyDropZone from './molecules/dropzones/SurveyDropZone';
import CanvasContent from './molecules/layout/CanvasContent';
import type { ComponentType, FormComponentData, CanvasProps } from './types';

const Canvas: React.FC<CanvasProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onMoveComponent,
  onAddComponent,
  onInsertWithPosition,
  onInsertBetween,
  onInsertHorizontal,
  onDropInContainer,
}) => {
  const dropRef = useRef<HTMLDivElement>(null);

  const handleInsertBetween = useCallback((type: ComponentType, insertIndex: number) => {
    if (onInsertBetween) {
      onInsertBetween(type, insertIndex);
    }
  }, [onInsertBetween]);

  const handleInsertHorizontal = useCallback((type: ComponentType, targetId: string, position: 'left' | 'right') => {
    if (onInsertHorizontal) {
      onInsertHorizontal(type, targetId, position);
    }
  }, [onInsertHorizontal]);

  const [{ isOver }, drop] = useDrop<
    { type: ComponentType },
    void,
    { isOver: boolean }
  >({
    accept: "component",
    drop: (item: { type: ComponentType }) => {
      onAddComponent(item.type);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={`canvas ${isOver ? 'canvas--drop-active' : ''}`}
      style={{
        flex: 1,
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        minHeight: '500px',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      <SurveyDropZone
        onInsertBetween={handleInsertBetween}
        onInsertHorizontal={handleInsertHorizontal}
        componentCount={components.length}
      >
        <CanvasContent
          components={components}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          onDeleteComponent={onDeleteComponent}
          onMoveComponent={onMoveComponent}
          onInsertWithPosition={onInsertWithPosition}
        />
      </SurveyDropZone>
    </div>
  );
};

export default Canvas;