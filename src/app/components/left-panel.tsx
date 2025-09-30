"use client";
import { useCallback, useRef, useState } from "react";
import { components } from "../datas/components";

export default function LeftPanel() {
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
      const newWidth = e.clientX;
      if (newWidth >= 240 && newWidth <= 500) {
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

  const onDragStart = (e: React.DragEvent, component: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(component));
  };

  return (
    <aside
      style={{ width: isCollapsed ? "80px" : `${width}px` }}
      className="bg-white dark:bg-gray-900 p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-800 relative transition-all duration-300"
    >
      <button
        onClick={toggleCollapse}
        className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-full"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <div className="mt-12">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4">
            {Object.values(components).map((category) => (
              <div
                key={category.label}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer"
                title={category.label}
              >
                <span className="text-2xl">{category.icon}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Components
            </h2>
            {Object.values(components).map((category) => (
              <div key={category.label} className="mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  {category.icon} {category.label}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {category.components.map((component) => (
                    <div
                      key={component.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, component)}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-center"
                    >
                      <span className="text-xl mr-3">{component.icon}</span>
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">
                          {component.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {component.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div
              onMouseDown={handleMouseDown}
              className="w-2 cursor-col-resize bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors absolute top-0 right-0 h-full"
            />
          </>
        )}
      </div>
    </aside>
  );
}