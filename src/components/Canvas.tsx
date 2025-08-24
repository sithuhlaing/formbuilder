import React, { useCallback, useRef } from "react";
import { useDrop } from "react-dnd";
import type { DropTargetMonitor } from "react-dnd";
import DraggableComponent from "./organisms/DraggableComponent";
import SurveyDropZone from "./molecules/SurveyDropZone";
import type { CanvasProps, FormComponentData, ComponentType } from "./types";
import LayoutContainer from "./LayoutContainer";

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

  // Update the renderComponent function to handle both container types:

  const renderComponent = useCallback(
    (component: FormComponentData, index: number) => {
      const isContainer = component.type === "horizontal_layout" || component.type === "vertical_layout";

      return (
        <div key={component.id} data-component-id={component.id}>
          <DraggableComponent
            component={component}
            index={index}
            isSelected={selectedComponentId === component.id}
            onSelect={onSelectComponent}
            onDelete={onDeleteComponent}
            onMove={onMoveComponent}
            onInsertWithPosition={onInsertWithPosition}
          >
            {isContainer && component.children && (
              <LayoutContainer
                container={component}
                onDrop={(item) => onDropInContainer(item, component.id)}
                renderComponent={renderComponent}
              />
            )}
          </DraggableComponent>
        </div>
      );
    },
    [
      selectedComponentId,
      onSelectComponent,
      onDeleteComponent,
      onMoveComponent,
      onInsertWithPosition,
      onDropInContainer,
    ]
  );

  const [{ isOver }, drop] = useDrop<
    { type: ComponentType; id?: string },
    void,
    { isOver: boolean }
  >({
    accept: "component",
    drop: (item: { type: ComponentType; id?: string }) => {
      if (item.id) {
        // This handles moving a component from a container to the root canvas
        onMoveComponent(item.id, null);
      } else if (item.type) {
        onAddComponent(item.type);
      }
      return {};
    },
    collect: (monitor: DropTargetMonitor) => ({
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
        {components.map((component, index) =>
          renderComponent(component, index)
        )}
      </SurveyDropZone>
    </div>
  );
};

export default Canvas;