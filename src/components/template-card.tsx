import { Template } from '@/types/template';

type TemplateCardProps = {
  template: Template;
  onViewDetails?: (template: Template) => void;
  onUseTemplate?: (template: Template) => void;
  showActions?: boolean;
  compact?: boolean;
};

export default function TemplateCard({ 
  template, 
  onViewDetails, 
  onUseTemplate,
  showActions = true,
  compact = false 
}: TemplateCardProps) {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(template);
    }
  };

  const handleUseTemplate = () => {
    if (onUseTemplate) {
      onUseTemplate(template);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-600 bg-emerald-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'hard': return 'text-rose-600 bg-rose-100';
      default: return 'text-cyan-600 bg-cyan-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical': return 'bg-cyan-500';
      case 'general': return 'bg-sky-500';
      default: return 'bg-purple-500';
    }
  };

  const builderHref = template.isCustom
    ? `/builder/preview?templateId=${template.id}&from=custom&cid=${template.id}`
    : `/builder/preview?templateId=${template.id}`;

  if (compact) {
    return (
      <div className="group cursor-grab rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sky-900">{template.name}</p>
            <p className="mt-1 text-xs text-sky-500">{template.fieldCount} fields • {template.estimatedTime}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </span>
              {template.isHipaaCompliant && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  HIPAA
                </span>
              )}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            {template.category.split('-')[0]}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex h-full flex-col rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-sky-900 group-hover:text-cyan-600">{template.name}</h3>
          <p className="mt-2 text-sm text-sky-600 line-clamp-2">{template.description}</p>
        </div>
        <div className="rounded-2xl bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-600">
          {template.category.replace(/-/g, ' ')}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className={`rounded-full px-3 py-1 ${getDifficultyColor(template.difficulty)}`}>
          {template.difficulty} build
        </span>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-600">
          {template.fieldCount} fields
        </span>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-600">
          ~{template.estimatedTime}
        </span>
        {template.isHipaaCompliant && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
            HIPAA ready
          </span>
        )}
        {template.isCustom && (
          <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
            Custom
          </span>
        )}
      </div>

      {template.tags && template.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {template.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-600">
              #{tag}
            </span>
          ))}
          {template.tags.length > 4 && (
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-500">
              +{template.tags.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-6">
        {showActions && (
          <div className="flex gap-3">
            {onViewDetails ? (
              <button
                onClick={handleViewDetails}
                className="flex-1 rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-600"
              >
                View outline
              </button>
            ) : (
              <a
                href={`/templates/${template.id}`}
                className="flex-1 rounded-xl border border-blue-100 bg-white px-4 py-2 text-center text-sm font-semibold text-sky-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-600"
              >
                View outline
              </a>
            )}

            {onUseTemplate ? (
              <button
                onClick={handleUseTemplate}
                className="flex-1 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600"
              >
                Use template
              </button>
            ) : (
              <a
                href={builderHref}
                className="flex-1 rounded-xl bg-cyan-500 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600"
              >
                Use template
              </a>
            )}
          </div>
        )}

        {template.version && (
          <p className="mt-3 text-xs text-sky-400">
            Version {template.version}
            {template.updatedAt && (
              <span> • Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
