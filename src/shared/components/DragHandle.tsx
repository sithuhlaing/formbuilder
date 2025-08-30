/**
 * Reusable Drag Handle Components
 * Provides consistent drag and control interfaces
 */

import React from 'react';
import { classNames } from '../utils';

interface DragControlsProps {
  onDelete?: () => void;
  className?: string;
  showDragHandle?: boolean;
  showDeleteButton?: boolean;
}

interface DragHandleProps {
  className?: string;
  style?: React.CSSProperties;
}

interface DeleteButtonProps {
  onClick?: () => void;
  className?: string;
  title?: string;
  size?: 'small' | 'medium' | 'large';
}

// Simple Drag Handle
export const DragHandle: React.FC<DragHandleProps> = ({
  className,
  style
}) => {
  return (
    <button 
      className={classNames('form-component__hover-action', 'form-component__hover-action--drag', className)}
      title="Drag to reorder"
      style={{ cursor: 'grab', ...style }}
      type="button"
    >
      ⋮⋮
    </button>
  );
};

// Delete Button
export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  className,
  title = "Delete component",
  size = 'medium'
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <button 
      className={classNames(
        'form-component__hover-action', 
        'form-component__hover-action--delete',
        `form-component__hover-action--${size}`,
        className
      )}
      title={title}
      onClick={handleClick}
      type="button"
    >
      ×
    </button>
  );
};

// Combined Drag Controls
export const DragControls: React.FC<DragControlsProps> = ({
  onDelete,
  className,
  showDragHandle = true,
  showDeleteButton = true
}) => {
  return (
    <div className={classNames('form-component__hover-controls', className)}>
      {showDragHandle && <DragHandle />}
      {showDeleteButton && onDelete && <DeleteButton onClick={onDelete} />}
    </div>
  );
};

// Row Layout Controls
export const RowLayoutControls: React.FC<{
  itemCount: number;
  onDelete?: () => void;
  className?: string;
}> = ({
  itemCount,
  onDelete,
  className
}) => {
  return (
    <div className={classNames('row-layout-container__header', className)}>
      <span>🏗️ Row Layout ({itemCount} items)</span>
      {onDelete && (
        <DeleteButton 
          onClick={onDelete}
          title="Delete row layout"
          className="row-layout-container__delete"
        />
      )}
    </div>
  );
};