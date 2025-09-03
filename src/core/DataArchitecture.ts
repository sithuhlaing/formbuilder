/**
 * Data Architecture Implementation
 * Provides comprehensive data management, transformation, and persistence
 */

import type { FormComponentData, ComponentType } from '../types/component';

// Core Data Interfaces
export interface FormState {
  templateId: string;
  templateName: string;
  pages: FormPage[];
  currentPageId: string;
  selectedComponentId: string | null;
  metadata: FormMetadata;
  validation: ValidationState;
  history: UndoRedoState;
}

export interface FormPage {
  id: string;
  title: string;
  components: FormComponentData[];
  order: number;
  validationRules?: ValidationRule[];
  metadata?: PageMetadata;
}

export interface FormMetadata {
  version: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  description?: string;
  settings: FormSettings;
}

export interface ValidationState {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  lastValidated: Date;
}

export interface UndoRedoState {
  history: FormState[];
  currentIndex: number;
  maxHistorySize: number;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  message?: string;
}

export interface ValidationError {
  componentId: string;
  fieldId: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning extends ValidationError {
  severity: 'warning';
}

export interface FormSettings {
  allowMultipleSubmissions: boolean;
  requireAuthentication: boolean;
  enableAutoSave: boolean;
  autoSaveInterval: number;
}

export interface PageMetadata {
  description?: string;
  estimatedTime?: number;
  isOptional?: boolean;
}

// Template Management
export interface Template {
  templateId: string;
  name: string;
  description?: string;
  pages: FormPage[];
  metadata: TemplateMetadata;
  settings: TemplateSettings;
  tags: string[];
  versions: TemplateVersion[];
}

export interface TemplateMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  usageCount: number;
  status: TemplateStatus;
  category: string;
}

export interface TemplateSettings {
  isPublic: boolean;
  allowDuplication: boolean;
  requiresApproval: boolean;
  permissions: AccessControl[];
}

export interface TemplateVersion {
  versionId: string;
  templateId: string;
  version: number;
  pages: FormPage[];
  createdAt: Date;
  changeLog: string;
  isActive: boolean;
}

export interface AccessControl {
  userId: string;
  permissions: ('read' | 'write' | 'admin')[];
}

export type TemplateStatus = 'draft' | 'published' | 'archived' | 'deprecated';

// Form Submission
export interface FormSubmission {
  submissionId: string;
  templateId: string;
  formData: Record<string, any>;
  metadata: SubmissionMetadata;
  validation: ValidationResult;
}

export interface SubmissionMetadata {
  submittedAt: Date;
  submittedBy?: string;
  ipAddress?: string;
  userAgent?: string;
  completionTime: number;
  pageViews: PageView[];
}

export interface PageView {
  pageId: string;
  enteredAt: Date;
  exitedAt?: Date;
  timeSpent: number;
}

// Data Transformation
export class ComponentTransformer {
  static normalize(raw: any): FormComponentData {
    return {
      id: raw.id || this.generateId(),
      type: raw.type,
      fieldId: raw.fieldId || `field_${raw.id}`,
      label: raw.label || '',
      required: Boolean(raw.required),
      placeholder: raw.placeholder,
      defaultValue: raw.defaultValue,
      validationRules: raw.validationRules || [],
      options: raw.options || [],
      children: raw.children?.map(child => this.normalize(child)) || [],
      helpText: raw.helpText,
      width: raw.width,
      height: raw.height,
      pattern: raw.pattern,
      min: raw.min,
      max: raw.max,
      step: raw.step,
      multiple: raw.multiple,
      accept: raw.accept,
      maxLength: raw.maxLength,
      minLength: raw.minLength,
      readOnly: raw.readOnly,
      disabled: raw.disabled
    };
  }

  static denormalize(component: FormComponentData): any {
    return {
      ...component,
      children: component.children?.map(child => this.denormalize(child))
    };
  }

  static validate(component: FormComponentData): ValidationResult {
    const errors: string[] = [];

    if (!component.id) errors.push('Component ID is required');
    if (!component.type) errors.push('Component type is required');
    if (!component.fieldId) errors.push('Field ID is required');
    if (!component.label?.trim()) errors.push('Component label is required');

    // Type-specific validation
    if (component.type === 'number_input') {
      if (component.min !== undefined && component.max !== undefined && component.min > component.max) {
        errors.push('Minimum value cannot be greater than maximum value');
      }
    }

    if (component.type === 'text_input' || component.type === 'textarea') {
      if (component.minLength !== undefined && component.maxLength !== undefined && component.minLength > component.maxLength) {
        errors.push('Minimum length cannot be greater than maximum length');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  static sanitize(component: FormComponentData): FormComponentData {
    return {
      ...component,
      label: component.label?.trim() || '',
      placeholder: component.placeholder?.trim(),
      helpText: component.helpText?.trim(),
      children: component.children?.map(child => this.sanitize(child))
    };
  }

  private static generateId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class LayoutTransformer {
  static flattenLayout(components: FormComponentData[]): FormComponentData[] {
    const flattened: FormComponentData[] = [];

    for (const component of components) {
      if (component.type === 'horizontal_layout' || component.type === 'vertical_layout') {
        if (component.children) {
          flattened.push(...this.flattenLayout(component.children));
        }
      } else {
        flattened.push({
          ...component,
          children: component.children ? this.flattenLayout(component.children) : undefined
        });
      }
    }

    return flattened;
  }

  static nestLayout(components: FormComponentData[]): FormComponentData[] {
    // Implementation for converting flat structure to nested layouts
    return components; // Simplified for now
  }

  static optimizeLayout(components: FormComponentData[]): FormComponentData[] {
    return components.map(component => {
      if (component.children) {
        const optimizedChildren = this.optimizeLayout(component.children);
        
        // Remove empty layouts
        if ((component.type === 'horizontal_layout' || component.type === 'vertical_layout') && 
            optimizedChildren.length === 0) {
          return null;
        }

        // Flatten single-child layouts
        if ((component.type === 'horizontal_layout' || component.type === 'vertical_layout') && 
            optimizedChildren.length === 1) {
          return optimizedChildren[0];
        }

        return { ...component, children: optimizedChildren };
      }
      return component;
    }).filter(Boolean) as FormComponentData[];
  }
}

export class FormDataTransformer {
  static toJSON(formState: FormState): string {
    return JSON.stringify(formState, null, 2);
  }

  static fromJSON(json: string): FormState {
    try {
      const parsed = JSON.parse(json);
      return this.validateFormState(parsed);
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
  }

  static toXML(formState: FormState): string {
    // XML export implementation
    return `<?xml version="1.0" encoding="UTF-8"?>
<form templateId="${formState.templateId}" name="${formState.templateName}">
  ${formState.pages.map(page => this.pageToXML(page)).join('\n  ')}
</form>`;
  }

  static fromXML(xml: string): FormState {
    // XML import implementation (simplified)
    throw new Error('XML import not yet implemented');
  }

  static toPDF(formState: FormState): Blob {
    // PDF export implementation
    throw new Error('PDF export not yet implemented');
  }

  private static pageToXML(page: FormPage): string {
    return `<page id="${page.id}" title="${page.title}">
  ${page.components.map(comp => this.componentToXML(comp)).join('\n    ')}
</page>`;
  }

  private static componentToXML(component: FormComponentData): string {
    return `<component type="${component.type}" id="${component.id}" label="${component.label}" />`;
  }

  private static validateFormState(data: any): FormState {
    if (!data.templateId) throw new Error('Template ID is required');
    if (!data.templateName) throw new Error('Template name is required');
    if (!Array.isArray(data.pages)) throw new Error('Pages must be an array');

    return data as FormState;
  }
}

export class SubmissionProcessor {
  static collect(formState: FormState, formElement: HTMLFormElement): FormSubmission {
    const formData = new FormData(formElement);
    const data: Record<string, any> = {};

    // Extract form data
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return {
      submissionId: this.generateSubmissionId(),
      templateId: formState.templateId,
      formData: data,
      metadata: {
        submittedAt: new Date(),
        completionTime: 0, // Calculate based on page views
        pageViews: []
      },
      validation: { isValid: true }
    };
  }

  static validate(submission: FormSubmission, schema: FormState): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    for (const page of schema.pages) {
      for (const component of page.components) {
        if (component.required && !submission.formData[component.fieldId]) {
          errors.push(`${component.label} is required`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  static transform(submission: FormSubmission, rules: TransformationRule[]): any {
    let transformed = { ...submission.formData };

    for (const rule of rules) {
      transformed = rule.apply(transformed);
    }

    return transformed;
  }

  static format(submission: FormSubmission, format: OutputFormat): string | Blob {
    switch (format) {
      case 'json':
        return JSON.stringify(submission, null, 2);
      case 'csv':
        return this.toCSV([submission]);
      case 'xml':
        return this.toXML(submission);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private static generateSubmissionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static toCSV(submissions: FormSubmission[]): string {
    if (submissions.length === 0) return '';

    const headers = Object.keys(submissions[0].formData);
    const rows = submissions.map(sub => 
      headers.map(header => sub.formData[header] || '').join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  private static toXML(submission: FormSubmission): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<submission id="${submission.submissionId}" templateId="${submission.templateId}">
  ${Object.entries(submission.formData).map(([key, value]) => 
    `<field name="${key}">${value}</field>`
  ).join('\n  ')}
</submission>`;
  }
}

// Supporting Types
export interface TransformationRule {
  apply(data: any): any;
}

export type OutputFormat = 'json' | 'csv' | 'xml' | 'pdf';

// Storage Strategy
export class StorageManager {
  private static readonly STORAGE_KEYS = {
    TEMPLATES: 'formbuilder_templates',
    DRAFTS: 'formbuilder_drafts',
    PREFERENCES: 'formbuilder_preferences',
    CACHE: 'formbuilder_cache'
  };

  static saveTemplate(template: Template): void {
    const templates = this.getTemplates();
    const existingIndex = templates.findIndex(t => t.templateId === template.templateId);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    localStorage.setItem(this.STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }

  static getTemplates(): Template[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.TEMPLATES);
    return stored ? JSON.parse(stored) : [];
  }

  static getTemplate(templateId: string): Template | null {
    const templates = this.getTemplates();
    return templates.find(t => t.templateId === templateId) || null;
  }

  static deleteTemplate(templateId: string): void {
    const templates = this.getTemplates().filter(t => t.templateId !== templateId);
    localStorage.setItem(this.STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }

  static saveDraft(formState: FormState): void {
    const drafts = this.getDrafts();
    drafts[formState.templateId] = formState;
    localStorage.setItem(this.STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
  }

  static getDrafts(): Record<string, FormState> {
    const stored = localStorage.getItem(this.STORAGE_KEYS.DRAFTS);
    return stored ? JSON.parse(stored) : {};
  }

  static clearDraft(templateId: string): void {
    const drafts = this.getDrafts();
    delete drafts[templateId];
    localStorage.setItem(this.STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
  }
}
