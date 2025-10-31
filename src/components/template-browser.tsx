import { useState } from 'react';
import { Template, TemplateFilter } from '@/types/template';
import TemplateCard from '@/components/template-card';
import EmptyState from '@/components/empty-state';

type TemplateBrowserProps = {
  templates: Template[];
  filter: TemplateFilter;
  onFilterChange: (filter: Partial<TemplateFilter>) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
};

export default function TemplateBrowser({
  templates,
  filter,
  onFilterChange,
  onClearFilters,
  totalCount,
  filteredCount
}: TemplateBrowserProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const hasActiveFilters = filter.category !== 'all' || 
                         filter.type !== 'all' || 
                         filter.difficulty !== 'all' || 
                         filter.search !== '';

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Templates
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by name, description, or tags..."
                value={filter.search}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {filter.search && (
                <button
                  onClick={() => onFilterChange({ search: '' })}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={filter.category}
              onChange={(e) => onFilterChange({ category: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="medical">Medical</option>
              <option value="general">General</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={filter.difficulty}
              onChange={(e) => onFilterChange({ difficulty: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Filter Tags and Clear */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <span className="text-sm text-gray-500">
                {filteredCount} of {totalCount} templates
              </span>
            )}
            {filter.category !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {filter.category}
                <button
                  onClick={() => onFilterChange({ category: 'all' })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </span>
            )}
            {filter.difficulty !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                {filter.difficulty}
                <button
                  onClick={() => onFilterChange({ difficulty: 'all' })}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </span>
            )}
            {filter.search && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                "{filter.search}"
                <button
                  onClick={() => onFilterChange({ search: '' })}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {hasActiveFilters ? 'Filtered Templates' : 'All Templates'}
          </h2>
          <p className="text-sm text-gray-500">
            {filteredCount} template{filteredCount !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Grid view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="List view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Templates Grid/List */}
      {templates.length === 0 ? (
        <EmptyState
          title="No Templates Found"
          description={hasActiveFilters 
            ? "Try adjusting your filters or search terms to find what you're looking for."
            : "No templates are available at the moment."
          }
          onAction={hasActiveFilters ? {
            text: "Clear Filters",
            onClick: onClearFilters
          } : undefined}
        />
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {templates.map((template) => (
            <div key={template.id} className={viewMode === 'list' ? 'border rounded-lg p-4 hover:shadow-md transition-shadow' : ''}>
              <TemplateCard 
                template={template} 
                compact={viewMode === 'list'}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More (for pagination) */}
      {templates.length > 0 && (
        <div className="text-center mt-8">
          <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Load More Templates
          </button>
        </div>
      )}
    </div>
  );
}
