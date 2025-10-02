"use client";
import React, { useState } from "react";
import ButtonRenderer from "./renderers/ButtonRenderer";
import CardRenderer from "./renderers/CardRenderer";
import CheckboxRenderer from "./renderers/CheckboxRenderer";
import DatePickerRenderer from "./renderers/DatePickerRenderer";
import DefaultRenderer from "./renderers/DefaultRenderer";
import EmailInputRenderer from "./renderers/EmailInputRenderer";
import FileUploadRenderer from "./renderers/FileUploadRenderer";
import HeadingRenderer from "./renderers/HeadingRenderer";
import HorizontalLayoutRenderer from "./renderers/HorizontalLayoutRenderer";
import MultiSelectRenderer from "./renderers/MultiSelectRenderer";
import NumberInputRenderer from "./renderers/NumberInputRenderer";
import PasswordInputRenderer from "./renderers/PasswordInputRenderer";
import RadioGroupRenderer from "./renderers/RadioGroupRenderer";
import RichTextRenderer from "./renderers/RichTextRenderer";
import SectionDividerRenderer from "./renderers/SectionDividerRenderer";
import SelectRenderer from "./renderers/SelectRenderer";
import SignatureRenderer from "./renderers/SignatureRenderer";
import TextAreaRenderer from "./renderers/TextAreaRenderer";
import TextInputRenderer from "./renderers/TextInputRenderer";
import VerticalLayoutRenderer from "./renderers/VerticalLayoutRenderer";
import {
  generateId,
  getSchemaType,
  getComponentType,
} from "../datas/schema";

const componentRenderers: { [key: string]: React.ComponentType<any> } = {
  text_input: TextInputRenderer,
  email_input: EmailInputRenderer,
  password_input: PasswordInputRenderer,
  number_input: NumberInputRenderer,
  textarea: TextAreaRenderer,
  rich_text: RichTextRenderer,
  select: SelectRenderer,
  multi_select: MultiSelectRenderer,
  checkbox: CheckboxRenderer,
  radio_group: RadioGroupRenderer,
  date_picker: DatePickerRenderer,
  file_upload: FileUploadRenderer,
  signature: SignatureRenderer,
  horizontal_layout: HorizontalLayoutRenderer,
  vertical_layout: VerticalLayoutRenderer,
  section_divider: SectionDividerRenderer,
  button: ButtonRenderer,
  heading: HeadingRenderer,
  card: CardRenderer,
};

interface CanvasProps {
  selectedComponent: any;
  setSelectedComponent: (component: any) => void;
}

export default function Canvas({
  selectedComponent,
  setSelectedComponent,
}: CanvasProps) {
  const [droppedComponents, setDroppedComponents] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Update the component in the canvas when selectedComponent changes
  React.useEffect(() => {
    if (selectedComponent && selectedIndex !== null) {
      setDroppedComponents((prev) => {
        const updated = [...prev];
        updated[selectedIndex] = selectedComponent;
        return updated;
      });
    }
  }, [selectedComponent, selectedIndex]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const transformComponentToSchema = (component: any) => {
    const id = generateId();
    const schemaType = getSchemaType(component.type);

    // For layout components
    if (component.type === "horizontal_layout") {
      return {
        id,
        type: schemaType,
        isLayout: true,
        columns: [
          { id: `col-1-${id}`, fields: [] },
          { id: `col-2-${id}`, fields: [] },
        ],
      };
    }

    if (component.type === "vertical_layout") {
      return {
        id,
        type: schemaType,
        isLayout: true,
        fields: [],
      };
    }

    // For regular form fields
    return {
      id,
      type: schemaType,
      label: component.properties?.label || component.label || "",
      required: component.properties?.required || false,
      placeholder: component.properties?.placeholder || "",
      ...component.properties,
    };
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentData = JSON.parse(
      e.dataTransfer.getData("application/json"),
    );
    console.log("Dropped component:", componentData);

    const transformedComponent = transformComponentToSchema(componentData);
    console.log("Transformed component:", transformedComponent);

    setDroppedComponents([...droppedComponents, transformedComponent]);
  };

  const handleComponentClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex(index);
    setSelectedComponent(droppedComponents[index]);
  };

  const handleCanvasClick = () => {
    setSelectedIndex(null);
    setSelectedComponent(null);
  };

  // Log the current state for debugging
  React.useEffect(() => {
    console.log("Canvas items:", droppedComponents);
  }, [droppedComponents]);

  const renderComponent = (component: any): React.ReactNode => {
    console.log(
      "Rendering component:",
      component.type,
      "Available renderers:",
      Object.keys(componentRenderers),
    );

    // Convert schema type back to component type for renderer
    const rendererType = getComponentType(component.type);
    const Renderer = componentRenderers[rendererType] || DefaultRenderer;

    // Normalize component structure for renderers (convert flat schema to nested properties)
    const normalizedComponent = {
      ...component,
      type: rendererType,
      properties: {
        label: component.label,
        placeholder: component.placeholder,
        required: component.required,
        ...component.properties,
      },
    };

    // Handle layout components with nested children
    if (component.type === "horizontal_layout" && component.columns) {
      return (
        <Renderer component={component}>
          {component.columns.map((column: any, colIndex: number) => (
            <div key={colIndex} className="flex-1">
              {column.fields?.map((field: any, fieldIndex: number) => (
                <div key={fieldIndex}>{renderComponent(field)}</div>
              ))}
            </div>
          ))}
        </Renderer>
      );
    }

    if (component.type === "vertical_layout" && component.fields) {
      return (
        <Renderer component={component}>
          {component.fields.map((field: any, fieldIndex: number) => (
            <div key={fieldIndex}>{renderComponent(field)}</div>
          ))}
        </Renderer>
      );
    }

    if (component.type === "card" && component.children) {
      return (
        <Renderer component={component}>
          {component.children.map((child: any, childIndex: number) => (
            <div key={childIndex}>{renderComponent(child)}</div>
          ))}
        </Renderer>
      );
    }

    // For regular components (input fields, etc.)
    return <Renderer component={normalizedComponent} />;
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={handleCanvasClick}
      className="flex-1 bg-gray-100 dark:bg-gray-800 p-8 overflow-y-auto"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 min-h-full border-2 border-dashed border-gray-300 dark:border-gray-700">
        {droppedComponents.length > 0 ? (
          droppedComponents.map((component, index) => (
            <div
              key={index}
              onClick={(e) => handleComponentClick(index, e)}
              className={`cursor-pointer p-2 rounded transition-all ${
                selectedIndex === index
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {renderComponent(component)}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-semibold">Drop components here</p>
              <p className="text-sm">
                Drag and drop from the left panel to build your form.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
