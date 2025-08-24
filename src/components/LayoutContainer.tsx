
import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import type { FormComponentData, ComponentType } from './types';

interface LayoutContainerProps {
  container: FormComponentData;
  onDrop: (item: { type: ComponentType; id?: string }, containerId: string) => void;
  renderComponent: (component: FormComponentData, index: number) => React.ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
}

const LayoutContainer: React.FC<LayoutContainerProps> = ({
  container,
  onDrop,
  renderComponent,
  isSelected = false,
  onSelect
}) => {
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['component', 'existing-component'],
    drop: (item: { type: ComponentType; id?: string }) => {
      onDrop(item, container.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drop(dropRef);

  const isHorizontal = container.type === 'horizontal_layout';
  const isVertical = container.type === 'vertical_layout';

  const containerClasses = [
    'layout-container',
    'border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px]',
    isSelected ? 'border-blue-500 bg-blue-50' : '',
    isOver && canDrop ? 'border-green-500 bg-green-50' : '',
    isHorizontal ? 'flex flex-row gap-4' : '',
    isVertical ? 'flex flex-col gap-4' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={dropRef}
      className={containerClasses}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {container.children && container.children.length > 0 ? (
        container.children.map((child, index) => (
          <div
            key={child.id}
            className={isHorizontal ? 'flex-1' : 'w-full'}
            style={child.layout?.width ? { width: child.layout.width } : undefined}
          >
            {renderComponent(child, index)}
          </div>
        ))
      ) : (
        <div className="text-gray-400 text-center py-8">
          Drop components here
        </div>
      )}
    </div>
  );
};

export default LayoutContainer;
