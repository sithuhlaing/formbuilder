
import React from 'react';
import type { FormComponentData, ComponentType, PositionDetectionResult } from '../../../types';
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from '../../../ItemTypes';
import { usePositionDetector } from '../hooks/usePositionDetector';
import DropIndicator from './DropIndicator';
// Simple inline component renderer to avoid cascading dependencies

interface SmartCanvasItemProps {
  component: FormComponentData;
  index: number;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onSmartDrop: (result: PositionDetectionResult & { componentType: ComponentType }) => void;
}

const SmartCanvasItem: React.FC<SmartCanvasItemProps> = ({
  component,
  index,
  selectedComponentId,
  onSelectComponent,
  onMoveComponent,
  onSmartDrop,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const { dropRef, dropPosition, isOver, canDrop } = usePositionDetector({
    onDrop: (item, position) => {
      if (item.type === ItemTypes.COMPONENT) {
        // This is a reorder
        onMoveComponent(item.index, index);
      } else {
        // This is a new component from the palette
        onSmartDrop({ ...position, componentType: item.type });
      }
    },
    itemRef: ref,
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.COMPONENT,
    item: { type: ItemTypes.COMPONENT, id: component.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: [ItemTypes.COMPONENT, ItemTypes.PALETTE_ITEM],
  });

  // Combine refs
  drag(drop(dropRef(ref)));

  const isSelected = selectedComponentId === component.id;
  const itemClasses = `
    canvas-item p-4 mb-4 bg-white border rounded-md shadow-sm cursor-pointer
    ${isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}
    ${isDragging ? 'opacity-50' : ''}
  `;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectComponent(component.id);
  };

  // Simple inline renderer to avoid cascading dependencies
  const renderComponent = (component: FormComponentData) => {
    const baseStyle: React.CSSProperties = {
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      backgroundColor: 'white',
    };

    switch (component.type) {
      case 'text_input':
        return (
          <div style={baseStyle}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              {component.label || 'Text Input'}
            </label>
            <input type="text" placeholder={component.placeholder} disabled style={{ width: '100%', padding: '4px' }} />
          </div>
        );
      case 'textarea':
        return (
          <div style={baseStyle}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              {component.label || 'Text Area'}
            </label>
            <textarea placeholder={component.placeholder} disabled style={{ width: '100%', padding: '4px' }} />
          </div>
        );
      default:
        return (
          <div style={baseStyle}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {component.type} - {component.label || 'Component'}
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={ref} className={itemClasses} onClick={handleClick} data-testid={`canvas-item-${index}`}>
      {renderComponent(component)}
      {isOver && canDrop && dropPosition && <DropIndicator position={dropPosition} />}
    </div>
  );
};

export default SmartCanvasItem;
