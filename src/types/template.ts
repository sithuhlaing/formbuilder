import type { FormComponentData } from './component';

// Template type definitions
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
  templateId: string;
  name: string;
  type: FormTemplateType;
  fields: FormComponentData[]; // For backward compatibility
  pages: FormPage[];
  createdDate: string;
  modifiedDate: string;
  jsonSchema: Record<string, unknown>;
  currentView?: 'desktop' | 'tablet' | 'mobile';
}