'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserTemplateCard from '@/components/user-template-card';
import EmptyState from '@/components/empty-state';
import { Template } from '@/types/template';
import { TemplateManager } from '@/utils/template-manager';

export default function MyTemplatesPage() {
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const manager = TemplateManager.getInstance();
    setCustomTemplates(manager.getCustomTemplates());
  }, []);

  const refreshTemplates = () => {
    const manager = TemplateManager.getInstance();
    setCustomTemplates(manager.getCustomTemplates());
  };

  const handleUse = (template: Template) => {
    const manager = TemplateManager.getInstance();
    manager.recordTemplateUsage(template.id);
    const params = new URLSearchParams({ templateId: template.id, from: 'custom', cid: template.id });
    router.push(`/builder/preview?${params.toString()}`);
  };

  const handleDelete = (template: Template) => {
    const manager = TemplateManager.getInstance();
    manager.deleteCustomTemplate(template.id);
    refreshTemplates();
  };

  const handleRename = (template: Template, newName: string) => {
    const manager = TemplateManager.getInstance();
    manager.updateCustomTemplate(template.id, { name: newName });
    refreshTemplates();
  };

  const handleRecategorize = (template: Template, newCategory: string) => {
    const manager = TemplateManager.getInstance();
    manager.updateCustomTemplate(template.id, {
      category: newCategory as any,
    });
    refreshTemplates();
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              My templates
            </h1>
            <p className="text-gray-600 mt-2">
              Manage templates you have customized or created from scratch.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/templates"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Browse catalog
            </Link>
            <Link
              href="/builder/preview"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Start from blank
            </Link>
          </div>
        </header>

        {customTemplates.length === 0 ? (
          <EmptyState
            title="No custom templates yet"
            description="Customize a catalog template or save an existing form to build your personal template library."
            actionLabel="Browse templates"
            onAction={() => router.push('/templates')}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {customTemplates.map((template) => (
              <UserTemplateCard
                key={template.id}
                template={template}
                onUse={handleUse}
                onDelete={handleDelete}
                onRename={handleRename}
                onRecategorize={handleRecategorize}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
