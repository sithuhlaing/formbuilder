"use client";
import React, { useState } from "react";

// Mock data for the selected component.
// In a real app, this would come from a state management solution.
const mockSelectedComponent = {
  type: "text_input",
  label: "Text Input",
  placeholder: "Enter your text here",
  required: false,
};

export default function RightPanel() {
  const [selectedComponent, setSelectedComponent] = useState(mockSelectedComponent);

  const renderProperties = () => {
    if (!selectedComponent) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Select a component to see its properties.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Label
          </label>
          <input
            type="text"
            value={selectedComponent.label}
            onChange={(e) =>
              setSelectedComponent({ ...selectedComponent, label: e.target.value })
            }
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
          />
        </div>

        {["text_input", "email_input", "password_input", "number_input", "textarea"].includes(
          selectedComponent.type
        ) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={selectedComponent.placeholder}
              onChange={(e) =>
                setSelectedComponent({
                  ...selectedComponent,
                  placeholder: e.target.value,
                })
              }
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
            />
          </div>
        )}

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="required"
            checked={selectedComponent.required}
            onChange={(e) =>
              setSelectedComponent({
                ...selectedComponent,
                required: e.target.checked,
              })
            }
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="required" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
            Required
          </label>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-1/4 bg-white dark:bg-gray-900 p-4 overflow-y-auto border-l border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Properties
      </h2>
      {renderProperties()}
    </aside>
  );
}