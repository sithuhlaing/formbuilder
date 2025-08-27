import React, { useRef, useState, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import type { DraggableComponentItemProps } from '../types';

const DraggableComponentItem: React.FC<DraggableComponentItemProps> = ({
  component,
  onAddComponent
}) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  drag(dragRef);

  const handleClick = useCallback(() => {
    const currentTime = Date.now();
    
    // Prevent double-clicks and clicks during drag
    if (isDragging || currentTime - lastClickTime < 500) {
      return;
    }
    
    setLastClickTime(currentTime);
    console.log('🟡 Click handler: Adding component via click:', component.type);
    onAddComponent(component.type);
  }, [isDragging, lastClickTime, component.type, onAddComponent]);

  return (
    <div
      ref={dragRef}
      className="draggable-component-item"
      onClick={handleClick}
      style={{
        padding: '12px 16px',
        margin: '4px 8px',
        backgroundColor: '#fff3cd', // Light yellow for visibility
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        transform: isDragging ? 'rotate(5deg)' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      title={`${component.description}\n\nClick to add or drag to canvas`}
    >
      <div
        style={{
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          flexShrink: 0
        }}
      >
        {component.icon}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {component.name}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#6b7280',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {component.description}
        </div>
      </div>
      
      <div
        style={{
          fontSize: '10px',
          color: '#9ca3af',
          opacity: 0.5,
          flexShrink: 0
        }}
      >
        ⋮⋮
      </div>
    </div>
  );
};

export default DraggableComponentItem;