/**
 * Clean Template Service - Template Management Feature
 * Single purpose: Handle template CRUD operations
 */

import type { FormPage } from '../../../types';

export interface FormTemplate {
  id: string;
  name: string;
  pages: FormPage[];
  createdAt: string;
  updatedAt: string;
}

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

  saveTemplate(template: Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt'>): FormTemplate {
    const templates = this.getAllTemplates();
    const newTemplate: FormTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    templates.push(newTemplate);
    localStorage.setItem(this.storageKey, JSON.stringify(templates));
    return newTemplate;
  }

  updateTemplate(id: string, updates: Partial<Pick<FormTemplate, 'name' | 'pages'>>): FormTemplate | null {
    const templates = this.getAllTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(templates));
    return templates[index];
  }

  deleteTemplate(id: string): boolean {
    const templates = this.getAllTemplates();
    const filtered = templates.filter(t => t.id !== id);
    
    if (filtered.length === templates.length) return false;
    
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return true;
  }

  getTemplate(id: string): FormTemplate | null {
    return this.getAllTemplates().find(t => t.id === id) || null;
  }
}

export const templateService = new TemplateService();