'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Template, TemplateBrowserState, TemplateFilter } from '@/types/template';
import { TemplateManager } from '@/utils/template-manager';

const defaultFilters: TemplateFilter = {
  category: 'all',
  type: 'all',
  difficulty: 'all',
  search: '',
  hipaaReady: false,
};

const initialState: TemplateBrowserState = {
  templates: [],
  filteredTemplates: [],
  filters: defaultFilters,
  loading: true,
  error: undefined,
};

const manager = typeof window !== 'undefined' ? TemplateManager.getInstance() : null;

const sortTemplates = (templates: Template[]): Template[] =>
  [...templates].sort((a, b) => a.name.localeCompare(b.name));

export function useTemplateManagement() {
  const [state, setState] = useState<TemplateBrowserState>(initialState);

  useEffect(() => {
    if (!manager) {
      return;
    }

    try {
      const storedFilters = manager.getFilters();
      const templates = sortTemplates(manager.getAllTemplates());
      const filtered = manager.filterTemplates(templates, storedFilters);

      setState({
        templates,
        filteredTemplates: filtered,
        filters: storedFilters,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load templates from manager', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load templates',
      }));
    }
  }, []);

  const updateFilters = useCallback(
    (updates: Partial<TemplateFilter>) => {
      setState((prev) => {
        const nextFilters = {
          ...prev.filters,
          ...updates,
        };

        let filteredTemplates: Template[] = prev.filteredTemplates;

        if (manager) {
          filteredTemplates = manager.filterTemplates(prev.templates, nextFilters);
          manager.setFilters(nextFilters);
        }

        return {
          ...prev,
          filters: nextFilters,
          filteredTemplates,
        };
      });
    },
    [],
  );

  const resetFilters = useCallback(() => {
    updateFilters(defaultFilters);
  }, [updateFilters]);

  const reloadTemplates = useCallback(() => {
    if (!manager) {
      return;
    }

    const templates = sortTemplates(manager.getAllTemplates());
    const filteredTemplates = manager.filterTemplates(templates, state.filters);

    setState((prev) => ({
      ...prev,
      templates,
      filteredTemplates,
    }));
  }, [state.filters]);

  const selectTemplate = useCallback((templateId: string) => {
    if (!manager) {
      return undefined;
    }

    const template = manager.getTemplateById(templateId);
    if (template) {
      manager.setCurrentTemplate(template.id, template.isCustom);
    }

    return template;
  }, []);

  const currentSession = useMemo(
    () => manager?.getCurrentSession(),
    [state.templates.length],
  );

  return {
    state,
    updateFilters,
    resetFilters,
    reloadTemplates,
    selectTemplate,
    currentSession,
  };
}
