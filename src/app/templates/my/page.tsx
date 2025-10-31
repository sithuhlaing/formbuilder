'use client';

import { useState, useEffect } from 'react';
import { Template, TemplateFilter } from '@/types/template';
import { TemplateManager } from '@/utils/template-manager';
import TemplateBrowser from '@/components/template-browser';

export default function MyTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TemplateFilter>({
    category: 'all',
    type: 'all',
    difficulty: 'all',
    search: ''
  });

  useEffect(() => {
    // Load custom templates
    const loadTemplates = async () => {
      try {
        setLoading(true);
        // Get custom templates from TemplateManager
        const templateManager = TemplateManager.getInstance();
        const customTemplates = templateManager.getCustomTemplates();
        setTemplates(customTemplates);
      } catch (error) {
        console.error('Failed to load custom templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  useEffect(() => {
    // Filter templates based on current filter
    let filtered = templates;

    // Category filter
    if (filter.category !== 'all') {
      filtered = filtered.filter(template => template.category === filter.category);
    }

    // Type filter
    if (filter.type !== 'all') {
      filtered = filtered.filter(template => template.type === filter.type);
    }

    // Difficulty filter
    if (filter.difficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === filter.difficulty);
    }

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, filter]);

  const handleFilterChange = (newFilter: Partial<TemplateFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const clearFilters = () => {
    setFilter({
      category: 'all',
      type: 'all',
      difficulty: 'all',
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-sky-600">Loading your templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-sky-900 mb-2">My Templates</h1>
              <p className="text-sky-600">
                Manage your custom form templates
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/templates"
                className="px-6 py-3 text-sm border border-blue-100 rounded-lg bg-white text-sky-700 transition-colors hover:border-cyan-200 hover:text-cyan-600 font-medium shadow-sm"
              >
                Browse Templates
              </a>
              <a
                href="/form-builder"
                className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium shadow-sm"
              >
                Create New Form
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {templates.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-6 text-cyan-500">📝</div>
            <h3 className="text-xl font-semibold text-sky-900 mb-3">No Custom Templates Yet</h3>
            <p className="text-sky-600 mb-8 max-w-lg mx-auto text-lg">
              You haven't created any custom templates yet. Start building forms and save them as templates to see them here.
            </p>
            <a
              href="/form-builder"
              className="inline-block px-8 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium shadow-sm"
            >
              Create Your First Template
            </a>
          </div>
        ) : (
          <TemplateBrowser
            templates={filteredTemplates}
            filter={filter}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            totalCount={templates.length}
            filteredCount={filteredTemplates.length}
          />
        )}
      </main>
    </div>
  );
}
