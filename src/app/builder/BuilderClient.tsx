'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import LivePreview from '@/components/live-preview';
import ValidationEditor from '@/components/validation-editor';
import LayoutEditor from '@/components/layout-editor';
import StyleSettings from '@/components/style-settings';
import SaveTemplateModal from '@/components/save-template-modal';
import { Template, ValidationRule, NhsStyleSettings, SaveTemplateData } from '@/types/template';
import { getTemplateById } from '@/app/datas/mock_tempates';
import { TemplateManager } from '@/utils/template-manager';
import { useBuilderTabs } from '@/hooks/use-builder-tabs';

type BuilderClientProps = {
  initialTab?: 'preview' | 'validation' | 'layout' | 'style';
  searchParams: Record<string, string | string[] | undefined>;
};

type FieldUpdater = (item: Template['pages'][number]['items'][number]) => Template['pages'][number]['items'][number];

const templateManager = typeof window !== 'undefined' ? TemplateManager.getInstance() : null;

const getParam = (params: BuilderClientProps['searchParams'], key: string): string | undefined => {
  const value = params?.[key];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

const withUpdatedValidation = (template: Template, fieldId: string | number, rules: ValidationRule[]): Template => {
  const apply: FieldUpdater = (item) => {
    if (item.id === fieldId) {
      const requiredRulePresent = rules.some((rule) => rule.type === 'required');
      return {
        ...item,
        required: requiredRulePresent,
        validation: rules,
      };
    }

    if (item.isLayout && item.columns) {
      return {
        ...item,
        columns: item.columns.map((column) => ({
          ...column,
          fields: column.fields.map(apply),
        })),
      };
    }

    if (item.children) {
      return {
        ...item,
        children: item.children.map(apply),
      };
    }

    return item;
  };

  return {
    ...template,
    pages: template.pages?.map((page) => ({
      ...page,
      items: page.items.map(apply),
    })) ?? [],
  };
};

const defaultStyleSettings: NhsStyleSettings = templateManager?.getStyleSettings() ?? {
  typographyScale: 'nhs-default',
  spacingScale: 'nhs-default',
  colorPreset: 'standard-aa',
  showLogo: false,
  logoUrl: undefined,
  clinicName: undefined,
  showFooter: false,
  footerText: undefined,
};

export default function BuilderClient({ initialTab = 'preview', searchParams }: BuilderClientProps) {
  const router = useRouter();
  const { tabs, activeTab, setActiveTab } = useBuilderTabs(initialTab);
  const [template, setTemplate] = useState<Template | null>(null);
  const [originalTemplate, setOriginalTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [styleSettings, setStyleSettings] = useState<NhsStyleSettings>(defaultStyleSettings);
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);

  const templateId = getParam(searchParams, 'templateId');
  const from = getParam(searchParams, 'from');
  const customId = getParam(searchParams, 'cid');

  useEffect(() => {
    if (templateManager) {
      setStyleSettings(templateManager.getStyleSettings());
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const targetingCustomTemplate = from === 'custom' && Boolean(customId);
        if (!templateId && !targetingCustomTemplate) {
          throw new Error('No template ID provided');
        }

        let foundTemplate: Template | undefined;
        if (templateId) {
          foundTemplate = getTemplateById(templateId);
        }

        if (!foundTemplate && templateManager) {
          const customTemplates = templateManager.getCustomTemplates();
          if (targetingCustomTemplate && customId) {
            foundTemplate = customTemplates.find((item) => item.id === customId);
          } else if (templateId) {
            foundTemplate = customTemplates.find((item) => item.id === templateId);
          }

          if (!foundTemplate && templateId) {
            foundTemplate = templateManager.getAllTemplates().find((item) => item.id === templateId);
          }
        }

        if (!foundTemplate) {
          throw new Error(`Template with ID "${targetingCustomTemplate ? customId : templateId}" not found`);
        }

        if (mounted) {
          setTemplate(foundTemplate);
          setOriginalTemplate(JSON.parse(JSON.stringify(foundTemplate)));
          templateManager?.recordTemplateUsage(foundTemplate.id);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load template';
        if (mounted) {
          setError(message);
          setTemplate(null);
          setOriginalTemplate(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [templateId, customId, from]);

  const recentTemplates = useMemo(() => templateManager?.getRecentTemplates() ?? [], [template]);

  const navigateToTab = (tabId: typeof activeTab.id) => {
    setActiveTab(tabId);

    const tab = tabs.find((item) => item.id === tabId);
    if (!tab) return;

    const params = new URLSearchParams();
    if (templateId) params.set('templateId', templateId);
    if (from) params.set('from', from);
    if (customId) params.set('cid', customId);

    const basePath = tab.id === 'preview' ? '/builder/preview' : `/builder/${tab.id}`;
    const queryString = params.toString();
    router.replace(queryString ? `${basePath}?${queryString}` : basePath, { scroll: false });
  };

  const handleResetTemplate = () => {
    if (!originalTemplate) return;
    setTemplate(JSON.parse(JSON.stringify(originalTemplate)));
  };

  const openSaveModal = () => setIsSavingModalOpen(true);
  const closeSaveModal = () => setIsSavingModalOpen(false);

  const handleSaveTemplate = (data: SaveTemplateData) => {
    if (!template || !templateManager) return;

    const saved = templateManager.saveCustomTemplate(data, template);
    templateManager.recordTemplateUsage(saved.id);
    router.push(`/templates/my?created=${saved.id}`);
  };

  const handleUpdateValidation = (fieldId: string | number, rules: ValidationRule[]) => {
    setTemplate((current) => {
      if (!current) return current;
      return withUpdatedValidation(current, fieldId, rules);
    });
  };

  const handleStyleChange = (updates: NhsStyleSettings) => {
    setStyleSettings(updates);
    templateManager?.updateStyleSettings(updates);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Loading template…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-600">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Error loading template</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.history.back()}
              className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              Go back
            </button>
            <button
              onClick={() => router.push('/templates')}
              className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Browse templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/templates')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to templates
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{template.name}</h1>
              <p className="text-sm text-gray-500">
                {template.category} • {template.fieldCount} fields • ~{template.estimatedTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetTemplate}
              className="rounded border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Reset to original
            </button>
            <button
              onClick={openSaveModal}
              className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save as custom template
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateToTab(tab.id)}
              className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                tab.id === activeTab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div>
            {activeTab.id === 'preview' && <LivePreview template={template} />}
            {activeTab.id === 'validation' && (
              <ValidationEditor template={template} onUpdateValidation={handleUpdateValidation} />
            )}
            {activeTab.id === 'layout' && <LayoutEditor template={template} />}
            {activeTab.id === 'style' && (
              <StyleSettings settings={styleSettings} onChange={handleStyleChange} />
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Template details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Type</dt>
                  <dd className="font-medium text-gray-900">{template.type.replace(/-/g, ' ')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Difficulty</dt>
                  <dd className="font-medium text-gray-900">{template.difficulty}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Estimated time</dt>
                  <dd className="font-medium text-gray-900">{template.estimatedTime}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">HIPAA</dt>
                  <dd className="font-medium text-gray-900">
                    {template.isHipaaCompliant ? 'Compliant' : 'Not required'}
                  </dd>
                </div>
              </dl>
            </section>

            {recentTemplates.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Recently opened</h2>
                <ul className="mt-4 space-y-3 text-sm text-blue-600">
                  {recentTemplates.map((recent) => (
                    <li key={recent.id}>
                      <button
                        type="button"
                        onClick={() => {
                          const params = new URLSearchParams({ templateId: recent.id });
                          router.push(`/builder/preview?${params.toString()}`);
                        }}
                        className="text-left font-medium hover:underline"
                      >
                        {recent.name}
                      </button>
                      <p className="text-xs text-gray-500">{recent.category}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {template.tags?.length ? (
              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </main>

      <SaveTemplateModal
        isOpen={isSavingModalOpen}
        onClose={closeSaveModal}
        onSave={handleSaveTemplate}
        defaultCategory={template.category}
        suggestedName={`${template.name} (Custom)`}
      />
    </div>
  );
}
