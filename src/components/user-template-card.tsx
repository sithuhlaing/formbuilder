import { useState } from 'react';
import { Template } from '@/types/template';

type UserTemplateCardProps = {
  template: Template;
  onUse?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onRename?: (template: Template, newName: string) => void;
  onRecategorize?: (template: Template, newCategory: string) => void;
  showActions?: boolean;
};

export default function UserTemplateCard({ 
  template,
  onUse,
  onEdit,
  onDelete,
  onRename,
  onRecategorize,
  showActions = true
}: UserTemplateCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(template.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUse = () => {
    if (onUse) {
      onUse(template);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(template);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(template);
    }
    setShowDeleteConfirm(false);
  };

  const handleRename = () => {
    if (onRename && editName.trim() && editName !== template.name) {
      onRename(template, editName.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditName(template.name);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(template.name);
  };

  const handleRecategorize = (category: string) => {
    if (onRecategorize) {
      onRecategorize(template, category);
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
      case 'documentation': return 'bg-green-500';
      default: return 'bg-purple-500';
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative">
      {/* Custom Template Badge */}
      <div className="absolute top-2 right-2">
        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
          Custom
        </span>
      </div>

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
              <div className="text-xs">Custom Template</div>
            </div>
          </div>
        )}
      </div>

      {/* Template Name (Editable) */}
      <div className="mb-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleRename}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              ✓
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-gray-600 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1">
              {template.name}
            </h3>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-gray-700 text-sm ml-2"
              title="Rename template"
            >
              ✏️
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
        {template.description}
      </p>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
          {template.difficulty}
        </span>
        <span className={`text-xs px-2 py-1 rounded text-white ${getCategoryColor(template.category)}`}>
          {template.category}
        </span>
        <span className="text-xs text-gray-500">
          {template.fieldCount} fields
        </span>
        <span className="text-xs text-gray-500">
          ~{template.estimatedTime}
        </span>
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
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleUse}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Use
          </button>
          <button
            onClick={handleEdit}
            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </div>
      )}

      {/* Management Actions */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Manage Template</span>
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Rename"
            >
              Rename
            </button>
            <button
              onClick={() => {
                const newCategory = prompt('Enter new category:', template.category);
                if (newCategory && newCategory !== template.category) {
                  handleRecategorize(newCategory);
                }
              }}
              className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Re-categorize"
            >
              Re-categorize
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Version and Dates */}
        <div className="text-xs text-gray-400">
          Version {template.version}
          {template.createdAt && (
            <span> • Created {new Date(template.createdAt).toLocaleDateString()}</span>
          )}
          {template.updatedAt && template.updatedAt !== template.createdAt && (
            <span> • Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Template?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{template.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
