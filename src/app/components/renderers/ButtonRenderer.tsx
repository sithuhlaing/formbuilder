import React from "react";

export default function ButtonRenderer({ component }: { component: any }) {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'outline':
        return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${getVariantClasses(component.properties.variant)}`}
      >
        {component.properties.label}
      </button>
    </div>
  );
}