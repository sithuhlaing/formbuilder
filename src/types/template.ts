export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  type: TemplateType;
  difficulty: TemplateDifficulty;
  fieldCount: number;
  estimatedTime: string; // e.g., "~6m"
  thumbnailUrl?: string;
  tags: string[];
  isCustom: boolean;
  isHipaaCompliant: boolean;
  createdAt?: string;
  updatedAt?: string;
  version?: string;
}

export type TemplateCategory = 
  | 'medical'
  | 'general'
  | 'contact-forms'
  | 'surveys'
  | 'registration-forms'
  | 'feedback-forms'
  | 'application-forms'
  | 'order-forms'
  | 'event-registration'
  | 'job-applications'
  | 'questionnaires'
  | 'medical-documentation'
  | 'health-records'
  | 'documentation';

export type TemplateType = 
  | 'patient-intake'
  | 'medical-history'
  | 'consent-form'
  | 'appointment-scheduling'
  | 'insurance-information'
  | 'contact'
  | 'survey'
  | 'registration'
  | 'feedback'
  | 'application'
  | 'order'
  | 'event'
  | 'job'
  | 'questionnaire'
  | 'general';

export type TemplateDifficulty = 'easy' | 'medium' | 'hard';

export interface Template extends TemplateMetadata {
  pages: TemplatePage[];
}

export interface TemplatePage {
  id: string;
  name: string;
  items: TemplateItem[];
}

export interface TemplateItem {
  id: number | string;
  type: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: ValidationRule[];
  isLayout?: boolean;
  columns?: TemplateColumn[];
  children?: TemplateItem[];
  // Layout-specific properties
  distribution?: 'equal' | 'auto' | 'custom';
  spacing?: 'tight' | 'normal' | 'loose';
  alignment?: 'top' | 'center' | 'bottom';
  wrapBehavior?: 'nowrap' | 'wrap';
}

export interface TemplateColumn {
  id: string;
  fields: TemplateItem[];
}

export interface ValidationRule {
  type: 'required' | 'pattern' | 'min' | 'max' | 'minLength' | 'maxLength';
  value?: string | number;
  message?: string;
  pattern?: string;
}

export interface TemplateFilter {
  category?: TemplateCategory | 'all';
  type?: TemplateType | 'all';
  difficulty?: TemplateDifficulty | 'all';
  search?: string;
  hipaaReady?: boolean;
}

export interface TemplateStorage {
  library: Template[];
  customTemplates: Template[];
  lastFilters: TemplateFilter;
  currentSession: {
    templateId?: string;
    customTemplateId?: string;
    lastModified: string;
  };
}

// NHS UK Specific Types
export interface NhsStyleSettings {
  typographyScale: 'nhs-default' | 'nhs-large' | 'custom';
  spacingScale: 'nhs-default' | 'nhs-compact' | 'custom';
  colorPreset: 'standard-aa' | 'high-contrast' | 'custom';
  showLogo: boolean;
  logoUrl?: string;
  clinicName?: string;
  showFooter: boolean;
  footerText?: string;
}

export interface BuilderTab {
  id: 'preview' | 'validation' | 'layout' | 'style';
  label: string;
  path: string;
}

// UI State Types
export interface TemplateBrowserState {
  templates: Template[];
  filteredTemplates: Template[];
  filters: TemplateFilter;
  loading: boolean;
  error?: string;
  selectedTemplate?: Template;
}

export interface BuilderState {
  template: Template;
  activeTab: BuilderTab;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: string;
}

// Save Template Modal Types
export interface SaveTemplateData {
  name: string;
  category: TemplateCategory;
  description: string;
  tags: string[];
  thumbnailType: 'auto-snapshot' | 'upload';
  thumbnailUrl?: string;
}

// Validation Editor Types
export interface FieldValidation {
  fieldId: string | number;
  fieldName: string;
  fieldType: string;
  rules: ValidationRule[];
  errors: string[];
  isValid: boolean;
}

// Layout Editor Types
export interface LayoutSection {
  id: string;
  name: string;
  rows: LayoutRow[];
}

export interface LayoutRow {
  id: string;
  columns: LayoutColumn[];
}

export interface LayoutColumn {
  id: string;
  width: number; // 1-12 grid system
  fields: TemplateItem[];
}

// Performance Monitoring Types
export interface PerformanceMetrics {
  templateLoadTime: number;
  previewRenderTime: number;
  builderResponseTime: number;
  memoryUsage: number;
}
