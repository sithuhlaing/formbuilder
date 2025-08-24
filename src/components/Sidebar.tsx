
import React, { useRef } from "react";
import { useDrag } from "react-dnd";
import Accordion from "./molecules/Accordion";
import type { SidebarProps, ComponentType } from "./types";

interface ComponentItemProps {
  type: ComponentType;
  label: string;
  description: string;
  icon: string;
  onAdd: () => void;
}

const ComponentItem: React.FC<ComponentItemProps> = ({
  type,
  label,
  description,
  icon,
  onAdd,
}) => {
  const dragRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "component",
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Connect the drag ref
  drag(dragRef);

  return (
    <div
      ref={dragRef}
      onClick={onAdd}
      className={`draggable-item ${isDragging ? "is-dragging" : ""}`}
    >
      <div className="draggable-item__header">
        <div className="draggable-item__icon">{icon}</div>
        <h4 className="draggable-item__title">{label}</h4>
      </div>
      <p className="draggable-item__description">{description}</p>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onAddComponent }) => {
  const componentTypes = [
    { type: "text_input" as ComponentType, label: "Text Input", description: "Single line text field", icon: "📝" },
    { type: "number_input" as ComponentType, label: "Number Input", description: "Numeric input with validation", icon: "🔢" },
    { type: "textarea" as ComponentType, label: "Textarea", description: "Multi-line text field", icon: "📄" },
    { type: "select" as ComponentType, label: "Select", description: "Dropdown selection", icon: "🔽" },
    { type: "multi_select" as ComponentType, label: "Multi-Select", description: "Multiple dropdown selections", icon: "✅" },
    { type: "checkbox" as ComponentType, label: "Checkbox", description: "Multiple selections", icon: "✔️" },
    { type: "radio_group" as ComponentType, label: "Radio Group", description: "Single selection", icon: "🔘" },
    { type: "date_picker" as ComponentType, label: "Date Picker", description: "Date selection", icon: "📅" },
    { type: "file_upload" as ComponentType, label: "File Upload", description: "File attachment", icon: "📎" },
    { type: "section_divider" as ComponentType, label: "Section Divider", description: "Organize form sections", icon: "➖" },
    { type: "signature" as ComponentType, label: "Signature", description: "Digital signature capture", icon: "✍️" },
    { type: "horizontal_layout" as ComponentType, label: "Horizontal Layout", description: "Arrange fields side by side", icon: "↔️" },
    { type: "vertical_layout" as ComponentType, label: "Vertical Layout", description: "Stack fields vertically", icon: "↕️" },
  ];

  const inputComponents = componentTypes.filter(c => 
    ["text_input", "number_input", "textarea", "date_picker", "file_upload", "signature"].includes(c.type)
  );
  
  const selectionComponents = componentTypes.filter(c => 
    ["select", "multi_select", "checkbox", "radio_group"].includes(c.type)
  );

  const layoutComponents = componentTypes.filter(c => 
    ["section_divider", "horizontal_layout", "vertical_layout"].includes(c.type)
  );

  return (
    <div>
      <Accordion title="Input Fields" icon="✏️" defaultExpanded={true}>
        <div className="component-grid">
          {inputComponents.map((component) => (
            <ComponentItem
              key={component.type}
              type={component.type}
              label={component.label}
              description={component.description}
              icon={component.icon}
              onAdd={() => onAddComponent(component.type)}
            />
          ))}
        </div>
      </Accordion>
      
      <Accordion title="Selection Fields" icon="☑️" defaultExpanded={true}>
        <div className="component-grid">
          {selectionComponents.map((component) => (
            <ComponentItem
              key={component.type}
              type={component.type}
              label={component.label}
              description={component.description}
              icon={component.icon}
              onAdd={() => onAddComponent(component.type)}
            />
          ))}
        </div>
      </Accordion>

      <Accordion title="Structure & Layout" icon="📐" defaultExpanded={false}>
        <div className="component-grid">
          {layoutComponents.map((component) => (
            <ComponentItem
              key={component.type}
              type={component.type}
              label={component.label}
              description={component.description}
              icon={component.icon}
              onAdd={() => onAddComponent(component.type)}
            />
          ))}
        </div>
      </Accordion>
    </div>
  );
};

export default Sidebar;
