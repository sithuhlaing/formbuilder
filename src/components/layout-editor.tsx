'use client';

import { useMemo } from 'react';
import { Template } from '@/types/template';

type LayoutEditorProps = {
  template: Template;
  onSelectField?: (fieldId: string | number) => void;
};

type LayoutItem = {
  id: string | number;
  label: string;
  depth: number;
  type: string;
};

const extractLayout = (template: Template): LayoutItem[] => {
  const items: LayoutItem[] = [];

  const traverse = (
    list: Template['pages'][number]['items'],
    depth: number,
  ) => {
    list.forEach((item) => {
      items.push({
        id: item.id,
        label: item.label ?? String(item.id),
        depth,
        type: item.type,
      });

      if (item.isLayout && item.columns) {
        item.columns.forEach((column) => traverse(column.fields, depth + 1));
      }

      if (item.children) {
        traverse(item.children, depth + 1);
      }
    });
  };

  template.pages?.forEach((page) => traverse(page.items, 0));

  return items;
};

export default function LayoutEditor({ template, onSelectField }: LayoutEditorProps) {
  const rows = useMemo(() => extractLayout(template), [template]);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
        Layout information will appear once components are added to the template.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Field
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Type
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Depth
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => onSelectField?.(row.id)}
            >
              <td className="px-4 py-3 text-sm text-gray-900">
                <span className="inline-flex items-center gap-2">
                  {row.depth > 0 && (
                    <span className="text-xs text-gray-400">{'—'.repeat(row.depth)}</span>
                  )}
                  {row.label}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{row.type.replace(/_/g, ' ')}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{row.depth}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 text-sm text-gray-600 bg-gray-50">
        Tip: drag a field in the builder canvas to adjust ordering. This table gives a high-level overview of nesting.
      </div>
    </div>
  );
}
