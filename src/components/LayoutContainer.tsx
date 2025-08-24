
import React from 'react';
import { useDrop } from 'react-dnd';
import { FormComponentData } from './types';

interface LayoutContainerProps {
  container: FormComponentData;
  onDrop: (item: any, containerId: string) => void;
  renderComponent: (component: FormComponentData, index: number) => React.ReactNode;
}

const LayoutContainer: React.FC<LayoutContainerProps> = ({ container, onDrop, renderComponent }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'component',
    drop: (item) => onDrop(item, container.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  const containerClasses = [
    'container-items',
    container.type === 'horizontal_layout' ? 'horizontal' : '',
    isActive ? 'is-over' : '',
  ].filter(Boolean).join(' ');

  return (
    <div ref={drop} className={containerClasses}>
      {container.children && container.children.length > 0 ? (
        container.children.map((child, index) => renderComponent(child, index))
      ) : (
        <div className="container-drop-zone">
          Drop components here
        </div>
      )}
    </div>
  );
};

export default LayoutContainer;
