import React from "react";

type HorizontalLayoutRendererProps = {
  component: any;
  children?: React.ReactNode;
};

export default function HorizontalLayoutRenderer({ component, children }: HorizontalLayoutRendererProps) {
  const childCount = component?.columns?.length ?? React.Children.count(children);

  return (
    <div className="rounded-2xl border border-dashed border-blue-200/60 bg-blue-50/40 p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide text-blue-700">
        <span>Row layout</span>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
          {childCount}/4 slots
        </span>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(childCount || 1, 4)}, minmax(0, 1fr))` }}>
        {children ?? (
          <div className="flex h-24 items-center justify-center rounded-xl border border-blue-200 bg-white/60 text-sm text-blue-500">
            Drop a component to fill this row
          </div>
        )}
      </div>
    </div>
  );
}
