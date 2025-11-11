'use client';

import { useState, useEffect } from 'react';
import { Template, TemplateFilter } from '@/types/template';
import { mockTemplates } from '@/app/datas/mock_tempates';
import TemplateBrowser from '@/components/template-browser';

export default function TemplatesPage() {
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
    // Load templates
    const loadTemplates = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setTemplates(mockTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Library</h1>
              <p className="text-gray-600">
                Browse and use professional form templates for every need
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/templates/my"
                className="px-6 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                My Templates
              </a>
              <a
                href="/form-builder"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Create New Form
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TemplateBrowser
          templates={filteredTemplates}
          filter={filter}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          totalCount={templates.length}
          filteredCount={filteredTemplates.length}
        />
      </main>
    </div>
  );
}
