import type React from "react";

export default function CardRenderer({
  component,
  children,
}: {
  component: any;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      {children ? (
        children
      ) : (
        <div className="min-h-[120px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <svg
              className="mx-auto h-8 w-8 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p className="text-sm">Drop components here</p>
          </div>
        </div>
      )}
    </div>
  );
}
