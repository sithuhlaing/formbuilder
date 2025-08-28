
import React from 'react';
import type { ComponentSelectProps } from '../../types/props';

const ComponentSelect: React.FC<React.PropsWithChildren<ComponentSelectProps>> = ({
  children,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    padding: isSelected ? '2px' : '0',
    border: isSelected ? '2px dashed #3b82f6' : '2px dashed transparent',
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
  };

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-12px',
    right: '-12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: 10,
  };

  return (
    <div style={wrapperStyle} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {children}
      {isSelected && (
        <button
          style={buttonStyle}
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) {
              onDelete();
            }
          }}
          title="Delete Component"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default ComponentSelect;
