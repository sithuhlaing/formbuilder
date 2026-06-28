import React from "react";

export default function SelectRenderer({ component, previewMode = false }: { component: any, previewMode?: boolean }) {
  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {component.properties.label}
      </label>
      <select 
        disabled={!previewMode}
        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
      >
        {component.properties.options.map((option: string, index: number) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
