
import React from "react";

interface DeleteButtonProps {
  onDelete: () => void;
  className?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  onDelete, 
  className = "text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded" 
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className={className}
      title="Delete component"
    >
      🗑️
    </button>
  );
};

export default DeleteButton;
