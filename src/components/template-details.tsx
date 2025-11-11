'use client';

import { Template } from '@/types/template';

type TemplateDetailsProps = {
  template: Template;
  onBack?: () => void;
  onUseTemplate?: (template: Template) => void;
  onSaveAsCustom?: (template: Template) => void;
};

export default function TemplateDetails({
  template,
  onBack,
  onUseTemplate,
  onSaveAsCustom,
}: TemplateDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to templates
          </button>
          <h1 className="text-3xl font-semibold text-gray-900 mt-3">
            {template.name}
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">{template.description}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onSaveAsCustom?.(template)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Save as custom template
          </button>
          <button
            onClick={() => onUseTemplate?.(template)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Use template
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <header className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Form structure
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Quick snapshot of pages and fields included in this template.
              </p>
            </header>
            <div className="px-6 py-4 space-y-4">
              {(template.pages ?? []).map((page, index) => (
                <div key={page.id} className="bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-500">
                        Page {index + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {page.name}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {page.items.length} item{page.items.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <ul className="px-4 py-3 space-y-2 text-sm text-gray-700">
                    {page.items.map((item) => (
                      <li key={item.id} className="flex items-start gap-2">
                        <span className="text-blue-600 text-lg leading-none mt-0.5">
                          •
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.label ?? item.type}
                          </div>
                          <div className="text-xs uppercase tracking-wide text-gray-500">
                            {item.type.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {(template.pages ?? []).length === 0 && (
                <p className="text-sm text-gray-500">
                  This template does not have pages defined yet.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <header className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Template metadata
              </h2>
            </header>
            <dl className="px-6 py-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Category</dt>
                <dd className="font-medium text-gray-900">
                  {template.category.replace(/-/g, ' ')}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Type</dt>
                <dd className="font-medium text-gray-900">
                  {template.type.replace(/-/g, ' ')}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Difficulty</dt>
                <dd className="font-medium text-gray-900">
                  {template.difficulty}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Fields</dt>
                <dd className="font-medium text-gray-900">
                  {template.fieldCount}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Completion time</dt>
                <dd className="font-medium text-gray-900">
                  {template.estimatedTime}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">HIPAA</dt>
                <dd className="font-medium text-gray-900">
                  {template.isHipaaCompliant ? 'HIPAA-ready' : 'Not required'}
                </dd>
              </div>
              {template.version && (
                <div className="flex items-center justify-between">
                  <dt className="text-gray-600">Version</dt>
                  <dd className="font-medium text-gray-900">
                    {template.version}
                  </dd>
                </div>
              )}
              {template.updatedAt && (
                <div className="flex items-center justify-between">
                  <dt className="text-gray-600">Last updated</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {template.tags && template.tags.length > 0 && (
            <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <header className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
              </header>
              <div className="px-6 py-4 flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
