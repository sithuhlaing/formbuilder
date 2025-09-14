/**
 * ALIGNED WITH DOCUMENTATION - Form Schema Types
 * These interfaces match the JSON Schema Architecture described in the documentation
 */
import type { FormComponentData, ValidationRule, ConditionalRule } from './component';

// FORM SCHEMA JSON - Template Structure
export interface FormSchema {
  // Metadata
  templateName: string;
  templateId: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  
  // Form structure
  pages: FormPage[];
  settings: FormSettings;
  theme: FormTheme;
  
  // Validation and logic
  globalValidationRules: ValidationRule[];
  dependencyRules: DependencyRule[];
  conditionalLogic: ConditionalLogicRule[];
}

export interface FormPage {
  id: string;
  title: string;
  description?: string;
  components: FormComponentData[];
  validationRules: PageValidationRule[];
  navigationSettings: PageNavigationSettings;
  
  // Layout configuration
  layoutConfig?: {
    columns: number;
    spacing: string;
    alignment: 'left' | 'center' | 'right';
  };
}

export interface FormSettings {
  allowSaveDraft: boolean;
  showProgressBar: boolean;
  enableAnalytics: boolean;
}

export interface FormTheme {
  primaryColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface DependencyRule {
  id: string;
  sourceField: string;
  targetField: string;
  condition: ConditionalRule;
  action: 'show' | 'hide' | 'enable' | 'disable';
}

export interface ConditionalLogicRule {
  id: string;
  conditions: ConditionalRule[];
  operator: 'AND' | 'OR';
  actions: Array<{
    type: 'show' | 'hide' | 'enable' | 'disable';
    targetField: string;
  }>;
}

export interface PageValidationRule {
  type: 'required_fields' | 'custom_validation' | 'conditional_logic';
  fields?: string[];           // Field IDs to validate
  validator?: (pageData: any) => ValidationResult;
  message?: string;
}

export interface PageNavigationSettings {
  showPrevious: boolean;
  showNext: boolean;
  showSubmit: boolean;
  previousLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
}

// INDIVIDUAL SUBMISSION JSON - Single Response
export interface IndividualSubmissionJSON {
  submissionId: string;
  templateId: string;
  templateVersion: string;
  submittedAt: string;
  submittedBy?: UserInfo;
  
  // Form response data
  formData: Record<string, any>;        // Simple field -> value mapping
  
  // Processing status
  status: 'submitted' | 'processed' | 'archived';
  processingResults?: {
    notifications: NotificationResult[];
    integrations: IntegrationResult[];
    workflows: WorkflowResult[];
  };
  
  // Single submission analytics
  analytics: {
    timeSpent: number;
    pageViews: PageViewData[];
    errorCount: number;
  };
}

export interface UserInfo {
  userId: string;
  email: string;
  name: string;
}

export interface NotificationResult {
  type: string;
  status: 'sent' | 'failed';
  message?: string;
}

export interface IntegrationResult {
  service: string;
  status: 'success' | 'failed';
  response?: any;
}

export interface WorkflowResult {
  workflowId: string;
  status: 'completed' | 'failed';
  result?: any;
}

export interface PageViewData {
  pageId: string;
  timeSpent: number;
  visitCount: number;
}

// SURVEY COLLECTION JSON - Aggregated Data
export interface SurveyDataCollectionJSON {
  collectionId: string;
  surveyName: string;
  templateId: string;
  templateVersion: string;
  
  // Collection period
  collectionPeriod: {
    startDate: string;
    endDate: string;
    totalResponses: number;
    targetResponses?: number;
  };
  
  // Aggregated responses
  responses: SurveyResponse[];
  
  // Statistical summary
  statistics: SurveyStatistics;
  
  // Response analysis
  analysis: {
    responseRate: number;              // Completion percentage
    averageCompletionTime: number;     // In milliseconds
    dropoffAnalysis: DropoffAnalysis;  // Where users quit
    qualityMetrics: QualityMetrics;    // Data quality indicators
  };
  
  // Data for visualization
  visualizationData: {
    charts: ChartDataset[];
    graphs: GraphDataset[];
    tables: TableDataset[];
  };
  
  // Export configurations
  exportConfig: {
    availableFormats: string[];        // pdf, xlsx, csv, json
    reportTemplate: string;
    chartStyles: ChartStyleConfig;
  };
}

export interface SurveyResponse {
  responseId: string;
  submittedAt: string;
  submittedBy?: UserInfo;
  
  // Response data organized by field
  fieldResponses: Record<string, FieldResponse>;
  
  // Response metadata
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    completionTime: number;
    isComplete: boolean;
  };
}

export interface FieldResponse {
  fieldId: string;
  fieldType: ComponentType;
  question: string;                    // The field label/question
  answer: any;                        // User's response
  answerDisplay: string;              // Human-readable answer
  
  // Response context
  responseTime: number;               // Time spent on this field
  attemptCount: number;               // Number of tries/edits
  confidence?: number;                // User confidence (if collected)
}

export interface SurveyStatistics {
  // Overall metrics
  totalResponses: number;
  completeResponses: number;
  partialResponses: number;
  responseRate: number;
  
  // Field-level statistics
  fieldStatistics: Record<string, FieldStatistics>;
  
  // Demographic breakdowns (if demographic fields exist)
  demographics?: DemographicBreakdown;
  
  // Time-based analysis
  timeAnalysis: {
    averageCompletionTime: number;
    medianCompletionTime: number;
    responsesByTimeOfDay: TimeDistribution[];
    responsesByDayOfWeek: DayDistribution[];
  };
  
  // Quality indicators
  dataQuality: {
    consistencyScore: number;          // 0-100, higher = more consistent
    completenessScore: number;         // 0-100, higher = more complete
    validityScore: number;             // 0-100, higher = more valid responses
    suspiciousResponses: string[];     // IDs of potentially fake responses
  };
}

export interface FieldStatistics {
  fieldId: string;
  fieldType: ComponentType;
  question: string;
  
  // Response metrics
  totalResponses: number;
  validResponses: number;
  skipRate: number;                    // Percentage who skipped this field
  
  // Type-specific statistics
  textStatistics?: {
    averageLength: number;
    wordCount: number;
    commonWords: Array<{word: string; count: number}>;
    sentimentScore?: number;           // If sentiment analysis is enabled
  };
  
  numericStatistics?: {
    min: number;
    max: number;
    mean: number;
    median: number;
    standardDeviation: number;
    distribution: Array<{range: string; count: number}>;
  };
  
  choiceStatistics?: {
    options: Array<{
      value: string;
      label: string;
      count: number;
      percentage: number;
    }>;
    topChoice: string;
    choiceDistribution: number[];
  };
  
  dateStatistics?: {
    earliestDate: string;
    latestDate: string;
    mostCommonDate: string;
    dateRangeDistribution: Array<{range: string; count: number}>;
  };
}

// Supporting interfaces for analytics and data visualization
export interface FormAnalytics {
  responseRate: number;
  averageCompletionTime: number;
  dropoffAnalysis: DropoffAnalysis;
  qualityMetrics: QualityMetrics;
}

export interface DropoffAnalysis {
  pageDropoffs: Record<string, number>;
  fieldDropoffs: Record<string, number>;
}

export interface QualityMetrics {
  completionRate: number;
  errorRate: number;
  averageTime: number;
}

export interface DemographicBreakdown {
  ageGroups?: Array<{
    range: string; // e.g., "18-25", "26-35"
    count: number;
    percentage: number;
  }>;
  genderDistribution?: Array<{
    gender: string;
    count: number;
    percentage: number;
  }>;
  locationData?: Array<{
    country?: string;
    region?: string;
    city?: string;
    count: number;
    percentage: number;
  }>;
  deviceTypes?: Array<{
    device: 'desktop' | 'mobile' | 'tablet';
    count: number;
    percentage: number;
  }>;
}

export interface TimeDistribution {
  hour: number;
  count: number;
}

export interface DayDistribution {
  day: string;
  count: number;
}

export interface ChartDataset {
  chartId: string;
  chartType: string;
  title: string;
  data: any;
}

export interface GraphDataset {
  nodes: Array<{
    id: string;
    label: string;
    value?: number;
    category?: string;
    metadata?: Record<string, any>;
  }>;
  edges?: Array<{
    source: string;
    target: string;
    weight?: number;
    label?: string;
  }>;
  graphType: 'network' | 'tree' | 'flowchart';
}

export interface TableDataset {
  columns: Array<{
    key: string;
    label: string;
    dataType: 'string' | 'number' | 'date' | 'boolean';
    sortable?: boolean;
    filterable?: boolean;
  }>;
  rows: Array<Record<string, any>>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalRows: number;
  };
}

export interface ChartStyleConfig {
  colorScheme: string[]; // Array of hex colors
  theme: 'light' | 'dark' | 'auto';
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar';
  responsive: boolean;
  animation: {
    enabled: boolean;
    duration: number; // in ms
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  };
  legend: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  axis?: {
    x: {
      label?: string;
      showGrid: boolean;
    };
    y: {
      label?: string;
      showGrid: boolean;
      min?: number;
      max?: number;
    };
  };
}

import type { ValidationResult } from './component';
import type { ComponentType } from './component';
