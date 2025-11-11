import React from "react";

interface TextInputPropertiesProps {
  component: any;
  onChange: (component: any) => void;
}

export default function TextInputProperties({
  component,
  onChange,
}: TextInputPropertiesProps) {
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type
        </label>
        <input
          type="text"
          value={component.type}
          disabled
          className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-600 dark:text-gray-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Label
        </label>
        <input
          type="text"
          value={component.properties?.label || ""}
          onChange={(e) =>
            onChange({
              ...component,
              properties: { ...component.properties, label: e.target.value },
            })
          }
          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Placeholder
        </label>
        <input
          type="text"
          value={component.properties?.placeholder || ""}
          onChange={(e) =>
            onChange({
              ...component,
              properties: {
                ...component.properties,
                placeholder: e.target.value,
              },
            })
          }
          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
        />
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="required"
          checked={component.properties?.required || false}
          onChange={(e) =>
            onChange({
              ...component,
              properties: {
                ...component.properties,
                required: e.target.checked,
              },
            })
          }
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label
          htmlFor="required"
          className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
        >
          Required
        </label>
      </div>
    </div>
  );
}
