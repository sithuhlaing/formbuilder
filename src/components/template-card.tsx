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
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical': return 'bg-blue-500';
      case 'general': return 'bg-gray-500';
      default: return 'bg-purple-500';
    }
  };

  const builderHref = template.isCustom
    ? `/builder/preview?templateId=${template.id}&from=custom&cid=${template.id}`
    : `/builder/preview?templateId=${template.id}`;

  if (compact) {
    return (
      <div className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold truncate">{template.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </span>
              <span className="text-xs text-gray-500">
                {template.fieldCount} fields
              </span>
            </div>
          </div>
          {template.isHipaaCompliant && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              HIPAA
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200 bg-white">
      {/* Thumbnail/Preview Area */}
      <div className="mb-4">
        {template.thumbnailUrl ? (
          <img 
            src={template.thumbnailUrl} 
            alt={template.name}
            className="w-full h-32 object-cover rounded border"
          />
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-xs">No Preview</div>
            </div>
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
          {template.difficulty}
        </span>
        <span className={`text-xs px-2 py-1 rounded text-white ${getCategoryColor(template.category)}`}>
          {template.category}
        </span>
        {template.isHipaaCompliant && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            HIPAA-ready
          </span>
        )}
        {template.isCustom && (
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
            Custom
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{template.fieldCount} fields</span>
        <span>~{template.estimatedTime}</span>
      </div>

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              +{template.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          {onViewDetails ? (
            <button
              onClick={handleViewDetails}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              View Details
            </button>
          ) : (
            <a
              href={`/templates/${template.id}`}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors text-center block"
            >
              View Details
            </a>
          )}
          
          {onUseTemplate ? (
            <button
              onClick={handleUseTemplate}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Use Template
            </button>
          ) : (
            <a
              href={builderHref}
              className="block flex-1 rounded bg-blue-600 px-3 py-2 text-center text-sm text-white transition-colors hover:bg-blue-700"
            >
              Use Template
            </a>
          )}
        </div>
      )}

      {/* Version Info */}
      {template.version && (
        <div className="mt-3 text-xs text-gray-400">
          Version {template.version}
          {template.updatedAt && (
            <span> • Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
      )}
    </div>
  );
}
