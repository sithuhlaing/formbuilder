'use client';

import { useEffect, useState } from 'react';
import { SaveTemplateData, TemplateCategory } from '@/types/template';

type SaveTemplateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveTemplateData) => void;
  defaultCategory?: TemplateCategory;
  suggestedName?: string;
};

const defaultData: SaveTemplateData = {
  name: '',
  category: 'general',
  description: '',
  tags: [],
  thumbnailType: 'auto-snapshot',
  thumbnailUrl: undefined,
};

export default function SaveTemplateModal({
  isOpen,
  onClose,
  onSave,
  defaultCategory = 'general',
  suggestedName = '',
}: SaveTemplateModalProps) {
  const [form, setForm] = useState<SaveTemplateData>({
    ...defaultData,
    category: defaultCategory,
    name: suggestedName,
  });
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        ...defaultData,
        category: defaultCategory,
        name: suggestedName,
      });
      setTagsInput('');
      setError(null);
    }
  }, [isOpen, defaultCategory, suggestedName]);

  if (!isOpen) {
    return null;
  }

  const updateField = <Key extends keyof SaveTemplateData>(key: Key, value: SaveTemplateData[Key]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setError('Template name is required');
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
      thumbnailUrl: form.thumbnailUrl?.trim() || undefined,
    });
    onClose();
  };

  const addTag = () => {
    const nextTag = tagsInput.trim();
    if (!nextTag || form.tags.includes(nextTag)) {
      return;
    }
    updateField('tags', [...form.tags, nextTag]);
    setTagsInput('');
  };

  const removeTag = (tag: string) => {
    updateField(
      'tags',
      form.tags.filter((existing) => existing !== tag),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <header className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Save as custom template</h2>
          <p className="mt-1 text-sm text-gray-600">
            Give your template a descriptive name and optional metadata to keep your library organised.
          </p>
        </header>
        <div className="space-y-4 px-6 py-6">
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">
              Template name <span className="text-red-500">*</span>
            </label>
            <input
              id="template-name"
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Cardiology intake baseline"
            />
          </div>

          <div>
            <label htmlFor="template-category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="template-category"
              value={form.category}
              onChange={(event) => updateField('category', event.target.value as TemplateCategory)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="medical">Medical</option>
              <option value="general">General</option>
              <option value="documentation">Documentation</option>
              <option value="registration-forms">Registration</option>
              <option value="feedback-forms">Feedback</option>
              <option value="health-records">Health Records</option>
              <option value="medical-documentation">Medical Documentation</option>
            </select>
          </div>

          <div>
            <label htmlFor="template-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="template-description"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe what this template is for so teammates can reuse it."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                  >
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove ${tag}`}
                      onClick={() => removeTag(tag)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700">Thumbnail</span>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="thumbnail-mode"
                  value="auto-snapshot"
                  checked={form.thumbnailType === 'auto-snapshot'}
                  onChange={(event) =>
                    updateField('thumbnailType', event.target.value as SaveTemplateData['thumbnailType'])
                  }
                />
                <span className="text-sm text-gray-700">Auto snapshot from builder preview</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="thumbnail-mode"
                  value="upload"
                  checked={form.thumbnailType === 'upload'}
                  onChange={(event) =>
                    updateField('thumbnailType', event.target.value as SaveTemplateData['thumbnailType'])
                  }
                />
                <span className="text-sm text-gray-700">Provide a custom image URL</span>
              </label>
              {form.thumbnailType === 'upload' && (
                <input
                  type="url"
                  value={form.thumbnailUrl ?? ''}
                  onChange={(event) => updateField('thumbnailUrl', event.target.value)}
                  placeholder="https://example.com/thumbnail.png"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <footer className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save template
          </button>
        </footer>
      </div>
    </div>
  );
}
