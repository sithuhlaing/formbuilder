import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import type { ComponentType } from '../../types';
import type { ComponentItem } from './data/componentGroups';

interface DraggableComponentProps {
  component: ComponentItem;
  onAddComponent: (type: ComponentType) => void;
  isMobile?: boolean;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  onAddComponent,
  isMobile = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  drag(ref);

  const handleClick = () => {
    if (isMobile) {
      onAddComponent(component.type);
    }
  };

  return (
    <div
      ref={ref}
      className={`draggable-component ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        margin: '4px 0',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        background: isDragging ? '#f3f4f6' : '#ffffff',
        cursor: isMobile ? 'pointer' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.backgroundColor = '#f8fafc';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.backgroundColor = isDragging ? '#f3f4f6' : '#ffffff';
      }}
    >
      <span 
        style={{ 
          fontSize: '16px', 
          marginRight: '8px' 
        }}
      >
        {component.icon}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#111827',
          marginBottom: '2px'
        }}>
          {component.name}
        </div>
        <div style={{ 
          fontSize: '11px', 
          color: '#6b7280' 
        }}>
          {component.description}
        </div>
      </div>
      {isMobile && (
        <span style={{ 
          fontSize: '12px', 
          color: '#9ca3af' 
        }}>
          Tap to add
        </span>
      )}
    </div>
  );
};