import React from "react";

export default function EmailInputRenderer({ component }: { component: any }) {
  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {component.properties.label}
        {component.properties.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      <input
        type="email"
        placeholder={component.properties.placeholder}
        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
        readOnly
      />
    </div>
  );
}