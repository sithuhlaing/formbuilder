import React from "react";

export default function RichTextRenderer({ component, previewMode = false }: { component: any, previewMode?: boolean }) {
  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {component.properties.label || "Rich Text Editor"}
      </label>
      <div className="border border-gray-300 dark:border-gray-600 rounded-md">
        <div className="flex items-center space-x-2 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 select-none">
          <button 
            disabled={!previewMode}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-200"
          >
            B
          </button>
          <button 
            disabled={!previewMode}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded italic disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-200"
          >
            I
          </button>
          <button 
            disabled={!previewMode}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded underline disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-200"
          >
            U
          </button>
        </div>
        <div 
          contentEditable={previewMode}
          suppressContentEditableWarning
          className={`p-3 min-h-[100px] bg-white dark:bg-gray-800 text-sm focus:outline-none ${
            previewMode ? "cursor-text" : "cursor-default"
          }`}
        >
          {component.properties.content || "Rich text content..."}
        </div>
      </div>
    </div>
  );
}
