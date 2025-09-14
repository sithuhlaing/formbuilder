export interface FormPage {
  id: string;
  title: string;
  components: any[]; // TODO: Replace with proper component type
  layout: {
    type: 'vertical' | 'horizontal';
    direction: 'column' | 'row';
  };
  order: number;
}

export interface FormTemplate {
  templateId: string;
  name: string;
  type: 'form' | 'survey' | 'other';
  fields: any[]; // TODO: Replace with proper field type
  pages: FormPage[];
  createdDate: string;
  modifiedDate: string;
  jsonSchema: Record<string, any>;
}

export interface TemplateService {
  getAllTemplates(): FormTemplate[];
  getTemplate(templateId: string): FormTemplate | null;
  saveTemplate(template: Pick<FormTemplate, 'name' | 'pages'>): FormTemplate;
  updateTemplate(templateId: string, updates: Partial<Pick<FormTemplate, 'name' | 'pages'>>): FormTemplate | null;
  deleteTemplate(templateId: string): boolean;
}
