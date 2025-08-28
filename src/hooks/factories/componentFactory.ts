
import type { FormComponentData, ComponentType } from "../../types";

export function useComponentFactory() {
  const generateId = () => Date.now().toString();

  const createComponent = (type: ComponentType): FormComponentData => {
    const id = generateId();
    const baseComponent = {
      id,
      type,
      label: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Field`,
      fieldId: `field_${id}`,
      required: false,
    };

    switch (type) {
      case "text_input":
        return {
          ...baseComponent,
          placeholder: "Enter text...",
        };
      case "email":
        return {
          ...baseComponent,
          placeholder: "Enter email...",
        };
      case "textarea":
        return {
          ...baseComponent,
          placeholder: "Enter your message...",
        };
      case "rich_text":
        return {
          ...baseComponent,
          placeholder: "Enter rich text content...",
        };
      case "select":
        return {
          ...baseComponent,
          options: ["Option 1", "Option 2", "Option 3"],
        };
      case "checkbox":
        return {
          ...baseComponent,
          options: ["Option 1", "Option 2", "Option 3"],
        };
      case "radio_group":
        return {
          ...baseComponent,
          options: ["Option 1", "Option 2", "Option 3"],
        };
      case "date_picker":
        return baseComponent;
      case "file_upload":
        return {
          ...baseComponent,
          acceptedFileTypes: ".pdf,.doc,.docx,.jpg,.png",
        };
      case "number_input":
        return {
          ...baseComponent,
          placeholder: "Enter number...",
          min: 0,
          step: 1,
        };
      case "multi_select":
        return {
          ...baseComponent,
          options: ["Option 1", "Option 2", "Option 3"],
        };
      case "section_divider":
        return {
          ...baseComponent,
          label: "Section Title",
          description: "Section description (optional)",
        };
      case "signature":
        return {
          ...baseComponent,
          label: "Digital Signature",
        };
      case "horizontal_layout":
        return {
          ...baseComponent,
          label: "Row Layout",
          layout: {
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
          },
          children: [],
        };
      case "vertical_layout":
        return {
          ...baseComponent,
          label: "Column Layout",
          layout: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          },
          children: [],
        };
      default:
        return baseComponent;
    }
  };

  return { createComponent };
}
