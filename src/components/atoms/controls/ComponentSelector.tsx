
import React from 'react';
import type { ComponentSelectProps } from '../../types/props';

const ComponentSelector: React.FC<ComponentSelectProps> = ({
  componentId,
  onSelect,
  isSelected
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(componentId);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        absolute inset-0 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50 bg-opacity-20' 
          : 'hover:ring-1 hover:ring-gray-300'
        }
      `}
    />
  );
};

export default ComponentSelector;
