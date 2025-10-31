"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { components } from "../datas/components";

const toSearchString = (value: string) => value.toLowerCase().trim();

const catalogSource = Object.values(components);

export default function LeftPanel() {
  const [width, setWidth] = useState(340);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(catalogSource[0]?.label ?? "");
  const isResizing = useRef(false);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = event.clientX;
    if (newWidth >= 260 && newWidth <= 520) {
      setWidth(newWidth);
    }
  }, []);

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const onDragStart = (event: React.DragEvent, component: any) => {
    const payload = {
      source: "palette" as const,
      component,
    };
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
  };

  const searchValue = toSearchString(query);
  const catalog = useMemo(() => {
    return catalogSource.map((category) => {
      const filtered = category.components.filter((component) => {
        if (!searchValue) return true;
        const haystack = `${component.label} ${component.description}`.toLowerCase();
        return haystack.includes(searchValue);
      });

      return {
        ...category,
        components: filtered,
      };
    });
  }, [searchValue]);

  const visibleCatalog = searchValue
    ? catalog.filter((category) => category.components.length > 0)
    : catalog;

  return (
    <aside
      style={{ width: isCollapsed ? "92px" : `${width}px` }}
      className="relative border-r border-blue-100 bg-gradient-to-b from-white via-sky-50 to-cyan-50 text-sky-700 transition-all duration-300"
    >
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-400 shadow-sm transition hover:bg-blue-100 hover:text-blue-600"
        title={isCollapsed ? "Expand palette" : "Collapse palette"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex h-full flex-col overflow-hidden">
        {isCollapsed ? (
          <div className="flex flex-1 flex-col items-center gap-6 pt-16">
            {catalog.map((category) => (
              <span
                key={category.label}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-white text-2xl text-blue-400 shadow"
                title={category.label}
              >
                {category.icon}
              </span>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-5 px-6 pb-4 pt-16">
              <div>
                <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-600">
                  Component library
                </span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-sky-900">
                  Drag a block into your flow
                </h2>
                <p className="mt-2 text-sm text-sky-600">
                  Drop any component onto the canvas. Drop beside another field to form a row automatically.
                </p>
              </div>

              <div className="relative">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search components…"
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm text-sky-700 shadow-sm placeholder:text-blue-300 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 transition hover:text-cyan-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {!searchValue && (
                <div className="flex flex-wrap gap-2">
                  {catalog.map((category) => (
                    <button
                      key={category.label}
                      onClick={() => setActiveCategory(category.label)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        activeCategory === category.label
                          ? "bg-cyan-500 text-white"
                          : "bg-white text-sky-600 shadow-sm hover:bg-sky-50"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-10">
              {(visibleCatalog.length === 0 ? catalog : visibleCatalog).map((category) => {
                const shouldHide =
                  !searchValue && activeCategory && activeCategory !== category.label;
                if (shouldHide) return null;

                return (
                  <div key={category.label} className="space-y-3">
                    <div className="flex items-center justify-between text-sky-600">
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-cyan-500">{category.icon}</span>
                        <span className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                          {category.label}
                        </span>
                      </div>
                      <span className="text-xs text-sky-400">
                        {category.components.length} item{category.components.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {category.components.map((component) => (
                        <button
                          key={component.type}
                          draggable
                          onDragStart={(event) => onDragStart(event, component)}
                          className="group flex items-start gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-200"
                        >
                          <span className="mt-1 text-xl text-cyan-500">{component.icon}</span>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-sky-800 group-hover:text-cyan-600">
                              {component.label}
                            </p>
                            <p className="text-xs text-sky-500">{component.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-cyan-200/50 transition hover:bg-cyan-400"
        />
      )}
    </aside>
  );
}
