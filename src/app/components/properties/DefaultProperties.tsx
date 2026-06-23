import React from "react";

interface DefaultPropertiesProps {
  component: any;
  onChange: (component: any) => void;
}

export default function DefaultProperties({
  component,
  onChange,
}: DefaultPropertiesProps) {
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

      {component.properties?.label !== undefined && (
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
      )}

      {component.properties?.options !== undefined && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Options (one per line)
          </label>
          <textarea
            value={component.properties.options.join("\n")}
            onChange={(e) =>
              onChange({
                ...component,
                properties: {
                  ...component.properties,
                  options: e.target.value.split("\n").filter((val) => val.trim() !== ""),
                },
              })
            }
            rows={5}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm font-mono focus:ring-blue-500 focus:border-blue-500"
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
      )}

      {component.properties?.required !== undefined && (
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
      )}
    </div>
  );
}
