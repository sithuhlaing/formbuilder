import type { FormComponentData } from './component';

// Template type definitions
export type FormTemplateType = "assessment" | "survey" | "application" | "feedback" | "registration" | "other";

export interface Page {
  id: string;
  title: string;
  components: FormComponentData[];
}

export interface FormPage {
  id: string;
  title: string;
  components: FormComponentData[];
  layout: any;
  description?: string;
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
  jsonSchema?: any;
}

export interface FormTemplate {
  templateId: string;
  name: string;
  type: FormTemplateType;
  fields: FormComponentData[]; // For backward compatibility
  pages: FormPage[];
  createdDate: string;
  modifiedDate: string;
  jsonSchema: any;
  currentView?: 'desktop' | 'tablet' | 'mobile';
}