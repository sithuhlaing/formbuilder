import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import DraggableComponent from "./organisms/DraggableComponent";
import SurveyDropZone from "./molecules/SurveyDropZone";
import type { CanvasProps } from "./types";

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
}) => {
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: "component",
    drop: (item: { type: any }) => {
      if (item.type) {
        onAddComponent(item.type);
      }
      return {};
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Connect the drop ref
  drop(dropRef);

  if (components.length === 0) {
    return (
      <div
        ref={dropRef}
        className={`drop-zone ${isOver ? "is-over" : ""}`}
      >
        <div className="empty-canvas">
          <div className="empty-canvas__icon">📝</div>
          <h3 className="empty-canvas__title">
            Start Building Your Form
          </h3>
          <p className="empty-canvas__description">
            Drag components from the sidebar to begin creating your form
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropRef}
      className={`drop-zone has-items ${isOver ? "is-over" : ""}`}
    >
      <SurveyDropZone
        onInsertBetween={onInsertBetween || (() => {})}
        onInsertHorizontal={onInsertHorizontal || (() => {})}
        componentCount={components.length}
      >
        {components.map((component, index) => (
          <div key={component.id} data-component-id={component.id}>
            <DraggableComponent
              component={component}
              index={index}
              isSelected={selectedComponentId === component.id}
              onSelect={onSelectComponent}
              onDelete={onDeleteComponent}
              onMove={onMoveComponent}
              onInsertWithPosition={onInsertWithPosition}
            />
          </div>
        ))}
      </SurveyDropZone>
    </div>
  );
};

export default Canvas;