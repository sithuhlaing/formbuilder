'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TemplateDetails from '@/components/template-details';
import SkeletonLoader from '@/components/skeleton-loader';
import EmptyState from '@/components/empty-state';
import { Template } from '@/types/template';
import { getTemplateById as getMockTemplateById } from '@/app/datas/mock_tempates';
import { TemplateManager } from '@/utils/template-manager';

export default function TemplateDetailsPage() {
  const params = useParams<{ templateId: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTemplate = () => {
      const templateId = params?.templateId;
      if (!templateId) {
        setError('Template ID missing from route');
        setLoading(false);
        return;
      }

      try {
        const mockTemplate = getMockTemplateById(templateId);

        if (mockTemplate) {
          if (isMounted) {
            setTemplate(mockTemplate);
            setLoading(false);
          }
          return;
        }

        const manager = TemplateManager.getInstance();
        const customTemplates = manager.getCustomTemplates();
        const foundCustom = customTemplates.find(
          (item) => item.id === templateId,
        );

        if (foundCustom) {
          if (isMounted) {
            setTemplate(foundCustom);
          }
        } else {
          const libraryTemplate = manager
            .getAllTemplates()
            .find((item) => item.id === templateId);

          if (libraryTemplate) {
            setTemplate(libraryTemplate);
          } else {
            setError(`Template "${templateId}" was not found`);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unexpected error while loading template',
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (typeof window !== 'undefined') {
      loadTemplate();
    }

    return () => {
      isMounted = false;
    };
  }, [params?.templateId]);

  const handleBack = () => router.push('/templates');
  const handleUse = (selected: Template) => {
    TemplateManager.getInstance().recordTemplateUsage(selected.id);
    router.push(`/builder/preview?templateId=${selected.id}`);
  };
  const handleSaveAsCustom = (selected: Template) => {
    TemplateManager.getInstance().recordTemplateUsage(selected.id);
    router.push(`/builder/preview?templateId=${selected.id}&mode=customize`);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <SkeletonLoader count={3} className="h-40" />
        ) : error ? (
          <EmptyState
            title="Template unavailable"
            description={error}
            onAction={{ text: "Back to templates", onClick: handleBack }}
          />
        ) : template ? (
          <TemplateDetails
            template={template}
            onBack={handleBack}
            onUseTemplate={handleUse}
            onSaveAsCustom={handleSaveAsCustom}
          />
        ) : (
          <EmptyState
            title="Template not found"
            description="We could not locate the requested template. It might have been deleted or is no longer available."
            onAction={{ text: "Back to templates", onClick: handleBack }}
          />
        )}
      </div>
    </main>
  );
}
