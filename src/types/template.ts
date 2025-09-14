/**
 * ALIGNED WITH DOCUMENTATION - Template Management Types
 * Supports template saving, loading, and management features
 */

import type { FormDefinition } from ".";
import type { FormComponentData } from "./component";

export type FormTemplateType = "assessment" | "survey" | "application" | "feedback" | "registration" | "referral" | "compliance" | "other";

export interface Page {
  id: string;
  title: string;
  components: FormComponentData[];
}

export interface FormPage {
  id: string;
  title: string;
  components: FormComponentData[];
  layout: Record<string, unknown>;
  description?: string;
  order: number;
}

export interface Template {
  templateId: string;
  name: string;
  pages: Page[];
  currentView?: 'desktop' | 'tablet' | 'mobile';
  fields?: FormComponentData[]; // For migrating legacy templates
  type?: FormTemplateType;
  createdDate?: string;
  modifiedDate?: string;
  jsonSchema?: Record<string, unknown>;
}

export interface FormTemplate {
  pages: boolean;
  templateId(templateId: any): unknown;
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  thumbnail?: string;
  formDefinition: FormDefinition;
  metadata: TemplateMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateCategory = 
  | 'contact'
  | 'survey'
  | 'registration'
  | 'feedback'
  | 'application'
  | 'order'
  | 'booking'
  | 'custom';

export interface TemplateMetadata {
  author: string;
  version: string;
  tags: string[];
  usageCount: number;
  rating: number;
  isPublic: boolean;
  isPremium: boolean;
}

export interface TemplateLibrary {
  templates: FormTemplate[];
  categories: TemplateCategory[];
  searchFilters: TemplateSearchFilters;
}

export interface TemplateSearchFilters {
  category?: TemplateCategory;
  tags?: string[];
  author?: string;
  rating?: number;
  sortBy: 'name' | 'created' | 'updated' | 'usage' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export interface TemplateImportResult {
  success: boolean;
  template?: FormTemplate;
  errors?: string[];
  warnings?: string[];
}

export interface TemplateExportOptions {
  includeAnalytics: boolean;
  includeMetadata: boolean;
  format: 'json' | 'yaml' | 'xml';
  compression: boolean;
}
