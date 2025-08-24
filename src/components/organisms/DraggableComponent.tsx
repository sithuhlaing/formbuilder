
import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import ComponentHeader from "../molecules/ComponentHeader";
import ComponentPreview from "../molecules/ComponentPreview";
import ComponentMetadata from "../molecules/ComponentMetadata";
import SmartDropZone from "../molecules/SmartDropZone";
import type { DraggableComponentProps, ComponentType } from "../types";

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  index,
  isSelected,
  onSelect,
  onDelete,
  onMove,
  onInsertWithPosition,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    { id: string; index: number },
    unknown,
    { handlerId: string | symbol | null }
  >({
    accept: "form-component",
    collect: (monitor) => ({ handlerId: monitor.getHandlerId() }),
    hover: (item, monitor) => {
      if (!ref.current || item.index === index) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if ((item.index < index && hoverClientY < hoverMiddleY) ||
          (item.index > index && hoverClientY > hoverMiddleY)) return;

      onMove(item.index, index);
      item.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "form-component",
    item: () => ({ id: component.id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const dragDropRef = (node: HTMLDivElement | null) => {
    ref.current = node;
    drag(node);
    drop(node);
  };

  const tooltipText = `${component.label}${component.required ? ' (Required)' : ''} - ${component.type.replace('_', ' ')}`;

  const componentContent = (
    <div
      ref={dragDropRef}
      data-handler-id={handlerId}
      className={`form-component ${
        isSelected ? "is-selected" : ""
      } ${isDragging ? "is-dragging" : ""}`}
      onClick={() => onSelect(component.id)}
      title={tooltipText}
    >
      <div className="form-component__hover-controls">
        <div 
          className="form-component__hover-action form-component__hover-action--drag"
          title="Drag to reorder"
          style={{ cursor: 'grab' }}
          onMouseDown={(e) => {
            // Allow the drag system to handle this
            e.stopPropagation();
          }}
        >
          ⋮⋮
        </div>
        <button 
          className="form-component__hover-action form-component__hover-action--delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(component.id);
          }}
          title="Delete component"
        >
          ×
        </button>
      </div>
      
      <ComponentPreview component={component} />
      <ComponentMetadata
        fieldId={component.fieldId}
        componentId={component.id}
        helpText={component.helpText}
      />
    </div>
  );

  // Wrap with SmartDropZone if the insert function is available
  if (onInsertWithPosition) {
    return (
      <SmartDropZone 
        componentId={component.id}
        onDropWithPosition={onInsertWithPosition}
      >
        {componentContent}
      </SmartDropZone>
    );
  }

  return componentContent;
};

export default DraggableComponent;
