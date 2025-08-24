
import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import type { FormComponentData, ComponentType } from "../types";

interface LayoutContainerProps {
  container: FormComponentData;
  onDrop: (item: { type: ComponentType; id?: string }, containerId: string) => void;
  renderComponent: (component: FormComponentData, index: number) => React.ReactNode;
}

const LayoutContainer: React.FC<LayoutContainerProps> = ({
  container,
  onDrop,
  renderComponent,
}) => {
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<
    { type: ComponentType; id?: string },
    void,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: "component",
    drop: (item) => onDrop(item, container.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Connect the drop target to the ref
  drop(dropRef);

  const isActive = isOver && canDrop;
  // Fix: Use the correct component type names
  const isHorizontal = container.type === "horizontal_layout";
  
  const containerClasses = [
    "container-items",
    isHorizontal ? "horizontal" : "vertical",
    isActive ? "is-over" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    gap: 'var(--space-2)',
    minHeight: '60px',
    padding: 'var(--space-2)',
    border: '2px dashed var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: isActive ? 'var(--color-primary-50)' : 'var(--color-gray-50)',
    borderColor: isActive ? 'var(--color-primary-300)' : 'var(--color-gray-300)',
  };

  return (
    <div ref={dropRef} className={containerClasses} style={containerStyle}>
      {container.children && container.children.length > 0 ? (
        container.children.map((child, index) => (
          <div 
            key={child.id} 
            style={{ 
              flex: isHorizontal ? `0 0 ${child.layout?.width || 'auto'}` : '0 0 auto',
              minWidth: isHorizontal ? '0' : 'auto'
            }}
          >
            {renderComponent(child, index)}
          </div>
        ))
      ) : (
        <div className="container-drop-zone" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40px',
          color: 'var(--color-gray-500)',
          fontSize: 'var(--text-sm)',
          fontStyle: 'italic'
        }}>
          Drop components here
        </div>
      )}
    </div>
  );
};

export default LayoutContainer;
