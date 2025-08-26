
import React from "react";
import UnifiedButton from './UnifiedButton';

interface DeleteButtonProps {
  onDelete: () => void;
  className?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  onDelete, 
  className = "" 
}) => {
  return (
    <UnifiedButton
      onClick={onDelete}
      title="Delete component"
      variant="danger"
      icon="🗑️"
      iconOnly={true}
      size="sm"
      stopPropagation={true}
      className={className}
    />
  );
};

export default DeleteButton;
