
import React, { useRef } from "react";
import { useDrag } from "react-dnd";

interface SidebarItemProps {
  id: string;
  icon?: React.ReactNode;
  label: string;
  description?: string;
  dragType?: string;
  dragData?: Record<string, unknown>;
  onClick?: () => void;
  className?: string;
  isDraggable?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  id,
  icon,
  label,
  description,
  dragType = "item",
  dragData,
  onClick,
  className = "",
  isDraggable = true,
}) => {
  const dragRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: dragType,
    item: dragData || { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isDraggable,
  });

  const setDragRef = (node: HTMLDivElement | null) => {
    dragRef.current = node;
    if (isDraggable) drag(node);
  };

  return (
    <div
      ref={setDragRef}
      className={`p-3 border border-gray-200 rounded-md cursor-pointer flex items-start space-x-3 hover:bg-gray-100 hover:border-blue-500 transition-all ${
        isDragging ? "opacity-50 shadow-lg" : "bg-white"
      } ${className}`}
      onClick={onClick}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  );
};

export default SidebarItem;
