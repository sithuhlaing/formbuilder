/**
 * Clean Template Service - Template Management Feature
 * Single purpose: Handle template CRUD operations
 */

import type { FormTemplate } from '../../../types';

// Remove local FormTemplate interface - use the global one

class TemplateService {
  private readonly storageKey = 'form-templates';

  getAllTemplates(): FormTemplate[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load templates:', error);
      return [];
    }
  }

  saveTemplate(template: Omit<FormTemplate, 'templateId' | 'createdDate' | 'modifiedDate'>): FormTemplate {
    const templates = this.getAllTemplates();
    const newTemplate: FormTemplate = {
      ...template,
      templateId: `template_${Date.now()}`,
      type: template.type || 'other',
      fields: template.fields || [],
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      jsonSchema: template.jsonSchema || {}
    };
    
    templates.push(newTemplate);
    localStorage.setItem(this.storageKey, JSON.stringify(templates));
    return newTemplate;
  }

  updateTemplate(templateId: string, updates: Partial<Pick<FormTemplate, 'name' | 'pages'>>): FormTemplate | null {
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