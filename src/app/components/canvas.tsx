"use client";
import React, { useState } from "react";
import TextInputRenderer from "./renderers/TextInputRenderer";
import SelectRenderer from "./renderers/SelectRenderer";
import DefaultRenderer from "./renderers/DefaultRenderer";
import EmailInputRenderer from "./renderers/EmailInputRenderer";
import PasswordInputRenderer from "./renderers/PasswordInputRenderer";
import NumberInputRenderer from "./renderers/NumberInputRenderer";
import TextAreaRenderer from "./renderers/TextAreaRenderer";
import RichTextRenderer from "./renderers/RichTextRenderer";
import MultiSelectRenderer from "./renderers/MultiSelectRenderer";
import CheckboxRenderer from "./renderers/CheckboxRenderer";
import RadioGroupRenderer from "./renderers/RadioGroupRenderer";
import DatePickerRenderer from "./renderers/DatePickerRenderer";
import FileUploadRenderer from "./renderers/FileUploadRenderer";
import SignatureRenderer from "./renderers/SignatureRenderer";
import HorizontalLayoutRenderer from "./renderers/HorizontalLayoutRenderer";
import VerticalLayoutRenderer from "./renderers/VerticalLayoutRenderer";
import SectionDividerRenderer from "./renderers/SectionDividerRenderer";
import ButtonRenderer from "./renderers/ButtonRenderer";
import HeadingRenderer from "./renderers/HeadingRenderer";
import CardRenderer from "./renderers/CardRenderer";

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

export default function Canvas() {
  const [droppedComponents, setDroppedComponents] = useState<any[]>([]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentData = JSON.parse(e.dataTransfer.getData("application/json"));
    console.log("Dropped component:", componentData);
    setDroppedComponents([...droppedComponents, componentData]);
  };

  const renderComponent = (component: any): React.ReactNode => {
    console.log("Rendering component:", component.type, "Available renderers:", Object.keys(componentRenderers));
    const Renderer = componentRenderers[component.type] || DefaultRenderer;

    // Handle layout components with nested children
    if (component.type === 'horizontal_layout' && component.columns) {
      return (
        <Renderer component={component}>
          {component.columns.map((column: any, colIndex: number) => (
            <div key={colIndex} className="flex-1">
              {column.fields?.map((field: any, fieldIndex: number) => (
                <div key={fieldIndex}>
                  {renderComponent(field)}
                </div>
              ))}
            </div>
          ))}
        </Renderer>
      );
    }

    if (component.type === 'vertical_layout' && component.fields) {
      return (
        <Renderer component={component}>
          {component.fields.map((field: any, fieldIndex: number) => (
            <div key={fieldIndex}>
              {renderComponent(field)}
            </div>
          ))}
        </Renderer>
      );
    }

    if (component.type === 'card' && component.children) {
      return (
        <Renderer component={component}>
          {component.children.map((child: any, childIndex: number) => (
            <div key={childIndex}>
              {renderComponent(child)}
            </div>
          ))}
        </Renderer>
      );
    }

    // For regular components (input fields, etc.)
    return <Renderer component={component} />;
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex-1 bg-gray-100 dark:bg-gray-800 p-8"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 min-h-full border-2 border-dashed border-gray-300 dark:border-gray-700">
        {droppedComponents.length > 0 ? (
          droppedComponents.map((component, index) => (
            <div key={index}>{renderComponent(component)}</div>
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
