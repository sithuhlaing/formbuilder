import React from "react";

export default function MultiSelectRenderer({ component }: { component: any }) {
  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {component.properties.label}
        {component.properties.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      <select
        multiple
        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm min-h-[100px]"
      >
        {component.properties.options.map((option: string, index: number) => (
          <option key={index} value={option} className="p-1">
            {option}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Hold Ctrl/Cmd to select multiple options
      </p>
    </div>
  );
}