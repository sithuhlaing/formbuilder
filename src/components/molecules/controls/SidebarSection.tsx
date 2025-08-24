
import React from "react";

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
  className = "",
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={`mb-6 ${className}`}>
      <div 
        className={`flex items-center justify-between mb-3 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {title}
        </h3>
        {collapsible && (
          <span className="text-gray-400">
            {isCollapsed ? '▶' : '▼'}
          </span>
        )}
      </div>
      {!isCollapsed && (
        <div className="space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default SidebarSection;
