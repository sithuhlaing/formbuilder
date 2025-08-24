
import React from 'react';
import ActionButton from './ActionButton';
import type { ComponentDeleteProps } from '../../types/props';

const ComponentDeleter: React.FC<ComponentDeleteProps> = ({
  componentId,
  onDelete
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(componentId);
  };

  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <ActionButton
        onClick={handleDelete} // Now this works correctly
        icon="🗑️"
        title="Delete component"
        variant="danger"
      />
    </div>
  );
};

export default ComponentDeleter;
