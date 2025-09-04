/**
 * Clean Template Service - Template Management Feature
 * Single purpose: Handle template CRUD operations
 */

import type { FormTemplate } from '../../../types';

// Remove local FormTemplate interface - use the global one

class TemplateService {
  private readonly storageKey = 'formTemplates';

  getAllTemplates(): FormTemplate[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      // Ensure we always return an array
      if (!Array.isArray(parsed)) {
        console.warn('Invalid templates data in localStorage, resetting to empty array');
        localStorage.removeItem(this.storageKey);
        return [];
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Clear corrupted data
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  saveTemplate(template: Pick<FormTemplate, 'name' | 'pages'>): FormTemplate {
    try {
      const templates = this.getAllTemplates();
      const newTemplate: FormTemplate = {
        ...template,
        templateId: `template_${Date.now()}`,
        type: 'other',
        fields: [],
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        jsonSchema: {}
      };
      
      templates.push(newTemplate);
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
      return newTemplate;
    } catch (error) {
      console.error('Failed to save template:', error);
      throw new Error('Failed to save template to localStorage');
    }
  }

  updateTemplate(templateId: string, updates: Partial<Pick<FormTemplate, 'name' | 'pages'>>): FormTemplate | null {
    try {
      const templates = this.getAllTemplates();
      const index = templates.findIndex(t => t.templateId === templateId);
      
      if (index === -1) return null;
      
      templates[index] = {
        ...templates[index],
        ...updates,
        modifiedDate: new Date().toISOString()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
      return templates[index];
    } catch (error) {
      console.error('Failed to update template:', error);
      return null;
    }
  }

  deleteTemplate(templateId: string): boolean {
    const templates = this.getAllTemplates();
    const filtered = templates.filter(t => t.templateId !== templateId);
    
    if (filtered.length === templates.length) return false;
    
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return true;
  }

  getTemplate(templateId: string): FormTemplate | null {
    return this.getAllTemplates().find(t => t.templateId === templateId) || null;
  }
}

export const templateService = new TemplateService();