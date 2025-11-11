'use client';

import { useMemo, useState } from 'react';
import { Template } from '@/types/template';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

type LivePreviewProps = {
  template: Template;
  initialDevice?: DeviceType;
};

const deviceStyles: Record<DeviceType, string> = {
  desktop: 'max-w-3xl',
  tablet: 'max-w-xl',
  mobile: 'max-w-sm',
};

const readableLabel = (text?: string) => text ?? 'Untitled field';

export default function LivePreview({ template, initialDevice = 'desktop' }: LivePreviewProps) {
  const [device, setDevice] = useState<DeviceType>(initialDevice);

  const pages = useMemo(() => template.pages ?? [], [template]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="space-x-2" role="group" aria-label="Preview device modes">
          {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDevice(option)}
              className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                device === option
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          {pages.length} page{pages.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-6 flex justify-center overflow-x-auto">
        <div className={`w-full ${deviceStyles[device]} rounded-2xl border-8 border-gray-900 bg-white p-6 shadow-xl`}>
          {pages.length === 0 ? (
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📄</div>
              <p>No fields defined for this template yet.</p>
            </div>
          ) : (
            pages.map((page) => (
              <section key={page.id} className="mb-8 last:mb-0">
                <header className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{page.name}</h2>
                </header>
                <div className="space-y-4">
                  {page.items.map((item) => {
                    if (item.isLayout && item.columns) {
                      return (
                        <div key={item.id} className="grid gap-4 md:grid-cols-2">
                          {item.columns.map((column) => (
                            <div key={column.id} className="space-y-4">
                              {column.fields.map((field) => (
                                <FieldPreview key={field.id} field={field} />
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return <FieldPreview key={item.id} field={item} />;
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

type FieldPreviewProps = {
  field: Template['pages'][number]['items'][number];
};

function FieldPreview({ field }: FieldPreviewProps) {
  switch (field.type) {
    case 'heading':
      return <h3 className="text-lg font-semibold text-gray-900">{readableLabel(field.label)}</h3>;
    case 'textarea':
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{readableLabel(field.label)}</label>
          <textarea
            disabled
            className="h-24 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
            placeholder={field.placeholder}
          />
        </div>
      );
    case 'checkbox':
    case 'radio_group':
      return (
        <fieldset className="space-y-3 rounded-md border border-gray-200 p-4">
          <legend className="text-sm font-medium text-gray-700">{readableLabel(field.label)}</legend>
          {field.options?.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-gray-600">
              <input type={field.type === 'checkbox' ? 'checkbox' : 'radio'} disabled />
              {option}
            </label>
          ))}
        </fieldset>
      );
    default:
      return (
        <div>
          {field.label && (
            <label className="mb-1 block text-sm font-medium text-gray-700">{readableLabel(field.label)}</label>
          )}
          <input
            disabled
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
            placeholder={field.placeholder}
          />
        </div>
      );
  }
}
