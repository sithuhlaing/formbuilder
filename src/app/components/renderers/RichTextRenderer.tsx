import React from "react";

export default function RichTextRenderer({ component }: { component: any }) {
  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {component.properties.label}
      </label>
      <div className="border border-gray-300 dark:border-gray-600 rounded-md">
        <div className="flex items-center space-x-2 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <button className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">B</button>
          <button className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded italic">I</button>
          <button className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded underline">U</button>
        </div>
        <div className="p-3 min-h-[100px] bg-white dark:bg-gray-800 text-sm">
          {component.properties.content || "Rich text content..."}
        </div>
      </div>
    </div>
  );
}