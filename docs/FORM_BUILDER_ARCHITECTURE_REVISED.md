# Form Builder Architecture Guide

## Table of Contents
1. [Overview & Core Principles](#overview--core-principles)
2. [User Interface Systems](#user-interface-systems)
   - [Drag and Drop Operations](#drag-and-drop-operations)
   - [Properties Panel & Inline Editing](#properties-panel--inline-editing)
   - [Multi-Page Wizard System](#multi-page-wizard-system)
   - [Preview Modal System](#preview-modal-system)
3. [Data Architecture](#data-architecture)
   - [JSON Schema Types](#json-schema-types)
   - [Data Flow & Operations](#data-flow--operations)
4. [Analytics & Reporting](#analytics--reporting)
   - [Survey Data Collection](#survey-data-collection)
   - [Visual Analytics & Charts](#visual-analytics--charts)
   - [PDF Export & Reports](#pdf-export--reports)
5. [Form Processing](#form-processing)
   - [Validation Engine](#validation-engine)
   - [Dependency Logic](#dependency-logic)
6. [Technical Implementation](#technical-implementation)

---

## Overview & Core Principles

### System Architecture

The Form Builder is a sophisticated drag-and-drop interface for creating dynamic forms with advanced layout management, validation, and analytics. It operates on a **headless JSON architecture**, separating form structure from visual presentation.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Visual UI     │    │  Business Logic │    │  JSON Schema    │
│                 │◄──►│                 │◄──►│                 │
│ • Drag & Drop   │    │ • State Engine  │    │ • Form Schema   │
│ • Multi-Page    │    │ • Validation    │    │ • Data Schema   │
│ • Preview Mode  │    │ • Analytics     │    │ • Constraints   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

- **ComponentEngine**: Single source of truth for all component operations
- **FormStateEngine**: Centralized state management with undo/redo support  
- **ComponentRenderer**: Unified rendering logic for builder and preview modes
- **Analytics Engine**: Survey data collection and visualization system

---

## User Interface Systems

### Drag and Drop Operations

The system supports **two distinct drag-and-drop operation types**:

#### Element Creation (Palette → Canvas)
**Purpose**: Add new form components
```typescript
// Creates NEW components with unique IDs
const newComponent = ComponentEngine.createComponent('text_input');
FormStateEngine.executeAction('ADD_COMPONENT', newComponent);
```

#### Layout Rearrangement (Canvas → Canvas)  
**Purpose**: Reorganize existing components without creating new ones
```typescript
// Moves EXISTING components to new positions
FormStateEngine.executeAction('MOVE_COMPONENT', {
  componentId: existingId,
  newPosition: dropPosition
});
```

#### Element Deletion
**Method**: Hover-based interface with delete button in component's top-right corner
```typescript
// Removes components from form
FormStateEngine.executeAction('DELETE_COMPONENT', componentId);
```

### Properties Panel & Inline Editing

#### Properties Panel Features
- **Dynamic Fields**: Panel adapts based on selected component type
- **Conditional Logic**: Additional fields appear for checkbox/radio/select components
- **Real-time Validation**: Immediate feedback on property changes

**Core Properties** (all components):
```typescript
interface BaseComponentProperties {
  label: string;           // Display name
  placeholder?: string;    // Input placeholder
  required: boolean;       // Mandatory field flag
  fieldId: string;         // Unique identifier for data mapping
}
```

**Type-Specific Properties**:
```typescript
// Text inputs: minLength, maxLength, pattern
// Select components: options[], multiple
// Rich text: height, toolbar options
// Layout containers: direction, spacing
```

#### Inline Editing System
**Trigger Methods**: 
- Double-click on component title/label
- Single-click when component already selected  
- F2 keyboard shortcut

**Supported Properties**:
- Component labels and titles
- Placeholder text
- Option labels for choice components

### Multi-Page Wizard System

#### Navigation Logic
The system automatically determines button visibility based on page position:

| Page Type | Navigation Buttons |
|-----------|-------------------|
| **Single Page** | `[Submit]` |
| **First Page** (2+ pages) | `[Next]` |
| **Middle Pages** | `[Previous] [Next]` |
| **Last Page** | `[Previous] [Submit]` |

#### Implementation
```typescript
interface PageNavigationSettings {
  showPrevious: boolean;
  showNext: boolean; 
  showSubmit: boolean;
  previousLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
}

// Navigation settings calculated automatically
const settings = PageNavigationLogic.calculateNavigationSettings(
  pageIndex, 
  totalPages
);
```

### Preview Modal System

The Preview Modal provides a **fully functional wizard interface** that simulates the actual form-filling experience:

#### Features
- **Complete Wizard Navigation**: Working Previous/Next/Submit buttons
- **Real-time Validation**: Page-level validation before navigation
- **Progress Indicators**: Visual progress bar and page counters
- **Form Testing**: Ability to fill and test complete form flow

#### Modal Integration
```typescript
<PreviewModal
  formSchema={formSchema}           // Complete form structure
  isOpen={showPreview}
  onSubmit={(data) => processTestSubmission(data)}
  initialData={testData}            // Optional pre-fill data
/>
```

---

## Data Architecture

### JSON Schema Types

The system operates on **three distinct JSON schema types**:

#### 1. Form Schema JSON (Template Structure)
**Purpose**: Define form structure, validation, and behavior  
**Usage**: Form building, rendering, validation

```typescript
interface FormSchema {
  // Metadata
  templateName: string;
  templateId: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  
  // Structure
  pages: FormPage[];
  settings: FormSettings;
  theme: FormTheme;
  
  // Logic
  globalValidationRules: ValidationRule[];
  dependencyRules: DependencyRule[];
  conditionalLogic: ConditionalLogicRule[];
}
```

#### 2. Individual Submission JSON (Single Response)
**Purpose**: Process individual form submissions  
**Usage**: Contact forms, registrations, single-use forms

```typescript
interface IndividualSubmissionJSON {
  submissionId: string;
  templateId: string;
  submittedAt: string;
  submittedBy: UserInfo;
  
  // Simple field → value mapping
  formData: Record<string, any>;
  
  status: 'submitted' | 'processed' | 'archived';
  analytics: SubmissionAnalytics;
}
```

#### 3. Survey Collection JSON (Aggregated Data)
**Purpose**: Collect and analyze multiple responses  
**Usage**: Research surveys, feedback forms, market research

```typescript
interface SurveyDataCollectionJSON {
  collectionId: string;
  surveyName: string;
  templateId: string;
  
  // Collection metadata
  collectionPeriod: {
    startDate: string;
    endDate: string;
    totalResponses: number;
  };
  
  // Aggregated responses
  responses: SurveyResponse[];
  statistics: SurveyStatistics;
  analysis: ResponseAnalysis;
  
  // Visualization data
  visualizationData: {
    charts: ChartDataset[];
    graphs: GraphDataset[];
    tables: TableDataset[];
  };
}
```

### Data Flow & Operations

#### Marshal/Unmarshal Operations
The system provides conversion between different schema types:

```typescript
// Form Builder State ↔ Form Schema JSON
const formSchema = JSONSchemaOperations.marshalFormSchema(builderState);
const builderState = JSONSchemaOperations.unmarshalFormSchema(formSchema);

// User Input → Individual Submission JSON
const submissionJSON = JSONSchemaOperations.marshalFormData(
  userInput, 
  formSchema, 
  metadata
);

// Individual Submission → Survey Collection
SurveyDataCollector.addResponseToCollection(collectionId, submissionJSON);
```

#### Schema Validation
```typescript
// Validate submission against form schema
const validation = SchemaMapper.validateDataAgainstSchema(
  submissionJSON, 
  formSchema
);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

---

## Analytics & Reporting

### Survey Data Collection

#### Statistical Analysis Engine
Automatically generates comprehensive statistics:

```typescript
interface SurveyStatistics {
  // Overall metrics
  totalResponses: number;
  completeResponses: number;
  partialResponses: number;
  responseRate: number;
  
  // Field-level analysis
  fieldStatistics: Record<string, FieldStatistics>;
  
  // Time-based analysis  
  timeAnalysis: TimeAnalysis;
  
  // Data quality scoring
  dataQuality: QualityMetrics;
}
```

#### Field-Level Statistics
Different statistics based on field type:

| Field Type | Statistics Generated |
|------------|---------------------|
| **Text Fields** | Average length, word count, sentiment analysis |
| **Choice Fields** | Response distribution, top choices, percentages |
| **Numeric Fields** | Min/max/mean/median, standard deviation, histograms |
| **Date Fields** | Date ranges, distribution patterns |

### Visual Analytics & Charts

#### Automatic Chart Generation
Charts generated based on field types:

| Field Type | Chart Type | Description |
|------------|------------|-------------|
| `select`, `radio_group` | **Pie Chart** | Response distribution |
| `multi_select`, `checkbox` | **Bar Chart** | Response counts |
| `number_input` | **Histogram** | Value distribution |
| `date_picker` | **Timeline** | Date-based trends |
| `text_input`, `textarea` | **Word Cloud** | Common words |

#### Interactive Dashboard
```typescript
interface AnalyticsDashboard {
  dashboardId: string;
  layout: DashboardLayout;
  filters: DashboardFilter[];
  drilldowns: DrilldownConfig[];
  realTimeEnabled: boolean;
}
```

### PDF Export & Reports

#### Export Types

**Individual Submission PDFs**:
- Clean form submission reports
- Professional templates with branding
- Form data presentation

**Survey Report PDFs**:
- Executive summary with key insights
- Statistical analysis tables
- Embedded charts and visualizations
- Methodology and appendices

#### Report Features
```typescript
interface PDFExportConfig {
  templateType: 'individual' | 'survey_report' | 'custom';
  
  content: {
    includeFormData: boolean;
    includeCharts: boolean;
    includeStatistics: boolean;
    includeRawData: boolean;
  };
  
  styling: {
    template: 'professional' | 'minimal' | 'branded' | 'academic';
    logo?: string;
    customBranding: BrandingOptions;
  };
  
  format: {
    pageSize: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
  };
}
```

---

## Form Processing

### Validation Engine

#### Multi-Level Validation
1. **Field-Level**: Individual component validation
2. **Page-Level**: Cross-field validation within pages  
3. **Form-Level**: Global validation across all pages
4. **Schema-Level**: Data structure validation

```typescript
interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => ValidationResult;
}

class ValidationEngine {
  static validateComponent(component: FormComponentData, value: any): ValidationResult;
  static validatePage(page: FormPage, pageData: any): ValidationResult;
  static validateForm(formSchema: FormSchema, formData: any): ValidationResult;
}
```

### Dependency Logic

#### Conditional Display Rules
```typescript
interface ConditionalRule {
  field: string;                    // Reference field ID
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than';
  value: any;                       // Comparison value
}

interface ConditionalDisplay {
  showWhen?: ConditionalRule;       // Show component when condition met
  hideWhen?: ConditionalRule;       // Hide component when condition met
}
```

#### Implementation
```typescript
class DependencyEngine {
  static evaluateCondition(rule: ConditionalRule, formData: any): boolean {
    const fieldValue = formData[rule.field];
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      case 'contains':
        return Array.isArray(fieldValue) 
          ? fieldValue.includes(rule.value)
          : String(fieldValue).includes(String(rule.value));
      // ... other operators
    }
  }
}
```

---

## Technical Implementation

### Core Architecture

#### Single Sources of Truth
- **ComponentEngine**: ALL component operations (CRUD, validation)
- **FormStateEngine**: ALL state management (actions, queries, undo/redo)
- **ComponentRenderer**: ALL rendering logic (builder and preview modes)

#### State Management
```typescript
class FormStateEngine {
  static executeAction(action: FormAction): FormState {
    // All state changes go through this centralized method
    const newState = this.reducer(currentState, action);
    this.addToHistory(newState);
    return newState;
  }
  
  static undo(): FormState;
  static redo(): FormState;
}
```

#### Component System
**Supported Component Types**:
```typescript
type ComponentType = 
  | 'text_input' | 'email_input' | 'password_input' | 'number_input'
  | 'textarea' | 'rich_text' | 'select' | 'multi_select' 
  | 'checkbox' | 'radio_group' | 'date_picker' | 'file_upload'
  | 'signature' | 'section_divider'
  | 'horizontal_layout' | 'vertical_layout';
```

### Performance Considerations

#### Optimization Strategies
- **React DnD**: Efficient drag-drop operations
- **Undo/Redo**: Optimized with 50-action limit
- **Component Rendering**: Memoization for expensive calculations
- **State Updates**: Immutable state patterns
- **Chart Generation**: Server-side rendering for PDF export

#### Scalability Features
- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: For large forms and data sets
- **Memory Management**: Automatic cleanup of unused resources
- **Caching**: Form schemas and processed data

---

## API Reference Summary

### Key Classes and Methods

```typescript
// Core Engines
ComponentEngine.createComponent(type: ComponentType): FormComponentData
ComponentEngine.validateComponent(component: FormComponentData): ValidationResult
FormStateEngine.executeAction(action: FormAction): FormState
ComponentRenderer.renderComponent(component: FormComponentData, mode: RenderMode): ReactNode

// Data Operations
JSONSchemaOperations.marshalFormSchema(builderState: FormBuilderState): FormSchema
JSONSchemaOperations.marshalFormData(userInput: Record<string, any>, formSchema: FormSchema): FormDataJSON
SchemaMapper.validateDataAgainstSchema(dataJSON: FormDataJSON, formSchema: FormSchema): ValidationResults

// Analytics
SurveyStatisticsEngine.generateStatistics(responses: SurveyResponse[], formSchema: FormSchema): SurveyStatistics
ChartGenerationEngine.generateChartsForSurvey(collection: SurveyDataCollectionJSON, formSchema: FormSchema): ChartDataset[]
PDFExportEngine.generateSurveyReportPDF(collection: SurveyDataCollectionJSON, formSchema: FormSchema): Buffer

// Validation & Dependencies
ValidationEngine.validateForm(formSchema: FormSchema, formData: any): ValidationResult
DependencyEngine.evaluateCondition(rule: ConditionalRule, formData: any): boolean
```

### Integration Points

#### Form Builder Hook
```typescript
const {
  formState,
  addComponent,
  updateComponent,
  deleteComponent,
  handleDrop,
  undo,
  redo,
  exportJSON,
  loadFromJSON
} = useFormBuilder(initialState);
```

#### Export Services
```typescript
// Individual submission export
const pdfBuffer = await PDFExportEngine.generateIndividualSubmissionPDF(submission, formSchema);

// Survey collection export  
const reportData = await SurveyExportService.exportSurveyData(collectionId, 'pdf');
```

This revised architecture document eliminates redundancy, resolves contradictions, and provides a clear, logical flow through the system's capabilities while maintaining comprehensive technical detail.