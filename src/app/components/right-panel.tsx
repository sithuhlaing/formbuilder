"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import TextInputProperties from "./properties/TextInputProperties";
import DefaultProperties from "./properties/DefaultProperties";

interface RightPanelProps {
  selectedComponent: any;
  setSelectedComponent: (component: any) => void;
}

const propertyRenderers: Record<string, React.ComponentType<any>> = {
  text_input: TextInputProperties,
  email_input: TextInputProperties,
  password_input: TextInputProperties,
  number_input: TextInputProperties,
  textarea: TextInputProperties,
};

const PropertyPlaceholder = () => (
  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-blue-100 bg-white text-center">
    <div className="space-y-3 px-6 py-12">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-2xl text-cyan-600">⚙️</div>
      <div>
        <h3 className="text-sm font-semibold text-sky-800">No component selected</h3>
        <p className="mt-1 text-xs text-sky-500">
          Click a block on the canvas to edit its label, validation, and presentation.
        </p>
      </div>
    </div>
  </div>
);

export default function RightPanel({ selectedComponent, setSelectedComponent }: RightPanelProps) {
  const [width, setWidth] = useState(340);
  const [collapsed, setCollapsed] = useState(false);
  const isResizing = useRef(false);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isResizing.current) return;
    const proposed = window.innerWidth - event.clientX;
    if (proposed >= 260 && proposed <= 540) {
      setWidth(proposed);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const propertyRenderer = useMemo(() => {
    if (!selectedComponent) return null;
    return propertyRenderers[selectedComponent.type] ?? DefaultProperties;
  }, [selectedComponent]);

  const renderContent = () => {
    if (!selectedComponent || !propertyRenderer) {
      return <PropertyPlaceholder />;
    }

    const Renderer = propertyRenderer;
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-500">Selected component</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-800">{selectedComponent.label ?? "Untitled field"}</p>
              <p className="text-xs text-sky-500">ID: {selectedComponent.fieldId ?? "–"}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-600">
              {selectedComponent.type?.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <Renderer component={selectedComponent} onChange={setSelectedComponent} />
        </div>

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-cyan-50 via-white to-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-sky-800">Need more controls?</h3>
          <p className="mt-1 text-xs text-sky-500">
            Advanced validation, conditional logic, and data bindings can be configured after export.
          </p>
        </div>
      </div>
    );
  };

  return (
    <aside
      style={{ width: collapsed ? "92px" : `${width}px` }}
      className="relative flex h-full flex-col border-l border-blue-100 bg-gradient-to-b from-white via-sky-50 to-cyan-50 transition-all duration-300"
    >
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-white text-cyan-500 shadow transition hover:bg-cyan-50"
        title={collapsed ? "Expand properties" : "Collapse properties"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className={`flex-1 overflow-y-auto px-6 pb-8 pt-16 ${collapsed ? "hidden" : "block"}`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-600">Properties</span>
            <h2 className="mt-3 text-xl font-semibold text-sky-900">Fine-tune the selection</h2>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-cyan-400">Changes autosave</p>
          </div>
        </div>

        <div className="mt-6">{renderContent()}</div>
      </div>

      {!collapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-cyan-200/50 transition hover:bg-cyan-400/70"
        />
      )}
    </aside>
  );
}
