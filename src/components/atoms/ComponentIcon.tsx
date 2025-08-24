
import React from "react";
import type { ComponentType } from "../types";

interface ComponentIconProps {
  type: ComponentType;
  className?: string;
}

const ComponentIcon: React.FC<ComponentIconProps> = ({ type, className = "text-xl" }) => {
  const getIcon = (componentType: ComponentType): string => {
    switch (componentType) {
      case "text_input": return "📝";
      case "number_input": return "🔢";
      case "textarea": return "📄";
      case "select": return "🔽";
      case "multi_select": return "✅";
      case "checkbox": return "☑️";
      case "radio_group": return "🔘";
      case "date_picker": return "📅";
      case "file_upload": return "📎";
      case "section_divider": return "➖";
      case "signature": return "✍️";
      case "horizontal_layout": return "↔️";
      case "vertical_layout": return "↕️";
      default: return "❓";
    }
  };

  return <span className={className}>{getIcon(type)}</span>;
};

export default ComponentIcon;
