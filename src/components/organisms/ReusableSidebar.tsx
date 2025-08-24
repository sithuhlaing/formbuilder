
import React from "react";
import SidebarSection from "../molecules/SidebarSection";

export interface SidebarItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  dragType?: string;
  dragData?: any;
  onClick?: () => void;
  isDraggable?: boolean;
}

export interface SidebarSectionData {
  title: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

interface ReusableSidebarProps {
  sections: SidebarSectionData[];
  className?: string;
  title?: string;
  renderItem?: (item: SidebarItem) => React.ReactNode;
}

const ReusableSidebar: React.FC<ReusableSidebarProps> = ({
  sections,
  className = "",
  title,
  renderItem,
}) => {
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {title && (
        <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {sections.map((section, index) => (
          <SidebarSection
            key={index}
            title={section.title}
            collapsible={section.collapsible}
            defaultCollapsed={section.defaultCollapsed}
          >
            {section.items.map((item) => 
              renderItem ? renderItem(item) : (
                <div key={item.id} className="default-item">
                  {item.label}
                </div>
              )
            )}
          </SidebarSection>
        ))}
      </div>
    </div>
  );
};

export default ReusableSidebar;
