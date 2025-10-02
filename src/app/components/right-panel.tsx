"use client";
import React, { useCallback, useRef, useState } from "react";
import TextInputProperties from "./properties/TextInputProperties";
import DefaultProperties from "./properties/DefaultProperties";

interface RightPanelProps {
  selectedComponent: any;
  setSelectedComponent: (component: any) => void;
}

const propertyRenderers: { [key: string]: React.ComponentType<any> } = {
  text_input: TextInputProperties,
  email_input: TextInputProperties,
  password_input: TextInputProperties,
  number_input: TextInputProperties,
  textarea: TextInputProperties,
};

export default function RightPanel({
  selectedComponent,
  setSelectedComponent,
}: RightPanelProps) {
  const [width, setWidth] = useState(320);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isResizing = useRef(false);

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
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <p>Select a component to see its properties.</p>
        </div>
      );
    }

    const PropertyRenderer =
      propertyRenderers[selectedComponent.type] || DefaultProperties;

    return (
      <PropertyRenderer
        component={selectedComponent}
        onChange={setSelectedComponent}
      />
    );
  };

  return (
    <aside
      style={{ width: isCollapsed ? "80px" : `${width}px` }}
      className="bg-white dark:bg-gray-900 p-4 overflow-y-auto border-l border-gray-200 dark:border-gray-800 relative transition-all duration-300"
    >
      <button
        onClick={toggleCollapse}
        className="absolute top-4 left-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform duration-300 ${
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
      <div className="mt-12">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer"
              title="Properties"
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
            <div
              onMouseDown={handleMouseDown}
              className="w-2 cursor-col-resize bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors absolute top-0 left-0 h-full"
            />
          </>
        )}
      </div>
    </aside>
  );
}
