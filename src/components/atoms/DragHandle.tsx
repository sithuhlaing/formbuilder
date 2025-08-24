
import React from "react";

interface DragHandleProps {
  className?: string;
}

const DragHandle: React.FC<DragHandleProps> = ({ className = "text-gray-400 hover:text-gray-600 cursor-move" }) => {
  return (
    <div className={className}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="3" cy="3" r="1"/>
        <circle cx="3" cy="8" r="1"/>
        <circle cx="3" cy="13" r="1"/>
        <circle cx="8" cy="3" r="1"/>
        <circle cx="8" cy="8" r="1"/>
        <circle cx="8" cy="13" r="1"/>
      </svg>
    </div>
  );
};

export default DragHandle;
