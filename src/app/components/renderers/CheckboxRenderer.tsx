export default function CheckboxRenderer({ component, previewMode = false }: { component: any, previewMode?: boolean }) {
  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm relative">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          disabled={!previewMode}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
          {component.properties.label}
          {component.properties.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      </div>
    </div>
  );
}
