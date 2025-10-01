"use client";
import React, { useCallback, useRef, useState } from "react";

// Mock data for the selected component.
// In a real app, this would come from a state management solution.
const mockSelectedComponent = {
  type: "text_input",
  label: "Text Input",
  placeholder: "Enter your text here",
  required: false,
};

export default function RightPanel() {
  const [width, setWidth] = useState(320);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isResizing = useRef(false);
  const [selectedComponent, setSelectedComponent] = useState(
    mockSelectedComponent,
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 240 && newWidth <= 600) {
        setWidth(newWidth);
      }
    }
  }, []);

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderProperties = () => {
    if (!selectedComponent) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Select a component to see its properties.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Label
          </label>
          <input
            type="text"
            value={selectedComponent.label}
            onChange={(e) =>
              setSelectedComponent({
                ...selectedComponent,
                label: e.target.value,
              })
            }
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
          />
        </div>

        {[
          "text_input",
          "email_input",
          "password_input",
          "number_input",
          "textarea",
        ].includes(selectedComponent.type) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={selectedComponent.placeholder}
              onChange={(e) =>
                setSelectedComponent({
                  ...selectedComponent,
                  placeholder: e.target.value,
                })
              }
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
            />
          </div>
        )}

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="required"
            checked={selectedComponent.required}
            onChange={(e) =>
              setSelectedComponent({
                ...selectedComponent,
                required: e.target.checked,
              })
            }
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label
            htmlFor="required"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
          >
            Required
          </label>
        </div>
      </div>
    );
  };

  return (
    <aside
      style={{ width: isCollapsed ? "48px" : `${width}px` }}
      className="bg-white dark:bg-gray-900 overflow-y-auto border-l border-gray-200 dark:border-gray-800 relative transition-all duration-300"
    >
      {/* Resize handle - always visible when not collapsed */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 left-0 w-1 h-full cursor-col-resize bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 hover:w-1.5 transition-all z-50"
        />
      )}

      {/* Toggle collapse button - positioned on the left edge */}
      <button
        onClick={toggleCollapse}
        className="absolute top-1/2 -translate-y-1/2 -left-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-1.5 rounded-full shadow-lg z-40 border border-gray-300 dark:border-gray-600"
        title={isCollapsed ? "Expand panel" : "Collapse panel"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform duration-300 ${
            isCollapsed ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Panel content */}
      <div className="p-4 mt-12">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer"
              title="Properties"
              onClick={toggleCollapse}
            >
              <span className="text-2xl">⚙️</span>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Properties
            </h2>
            {renderProperties()}
          </>
        )}
      </div>
    </aside>
  );
}
