import React from "react";

export default function RadioGroupRenderer({ component }: { component: any }) {
  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {component.properties.label}
        {component.properties.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      <div className="space-y-2">
        {component.properties.options.map((option: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="radio"
              name={`radio-${component.id || "group"}`}
              value={option}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              readOnly
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
