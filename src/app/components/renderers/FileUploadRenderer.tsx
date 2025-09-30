import React from "react";

export default function FileUploadRenderer({ component }: { component: any }) {
  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {component.properties.label}
        {component.properties.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
              Click to upload
            </span>
            <span> or drag and drop</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, PDF up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
}