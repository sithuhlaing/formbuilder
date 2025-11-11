# Visual Form Builder - Component System

**Version**: 1.0
**Date**: November 1, 2025
**Status**: Implementation-Ready

---

## 1. Component Type System

### Complete Component Catalog

```typescript
// Input Components
type InputComponentType =
  | 'text_input'      // Single line text
  | 'email_input'     // Email validation
  | 'password_input'  // Masked input
  | 'number_input'    // Numeric input
  | 'textarea'        // Multi-line text
  | 'rich_text';      // WYSIWYG editor (future)

// Selection Components
type SelectionComponentType =
  | 'select'          // Single select dropdown
  | 'multi_select'    // Multiple selection
  | 'checkbox'        // Boolean/multiple checkboxes
  | 'radio_group';    // Mutually exclusive options

// Special Components
type SpecialComponentType =
  | 'date_picker'     // Date selection
  | 'file_upload'     // File input
  | 'signature';      // Signature pad (future)

// Layout Components
type LayoutComponentType =
  | 'horizontal_layout';  // Row container (2-4 components)

// UI Components
type UIComponentType =
  | 'section_divider' // Visual separator
  | 'button'          // Action button
  | 'heading'         // Text heading
  | 'card';           // Content container

type ComponentType =
  | InputComponentType
  | SelectionComponentType
  | SpecialComponentType
  | LayoutComponentType
  | UIComponentType;
```

---

## 2. Base Component Structure

### Universal Component Interface

```typescript
interface FormComponentData {
  // Identification
  type: ComponentType;
  id: string;                    // Unique UUID
  fieldId: string;               // For data collection (empty for UI-only)

  // Content
  label: string;                 // Display label
  required: boolean;             // Mark as required

  // Validation
  validation: ValidationRules;   // Component-specific rules
  properties: Record<string, any>; // Component configuration

  // Layout (for row children)
  children?: FormComponentData[]; // For horizontal_layout only
}

interface ValidationRules {
  // Common rules
  minLength?: number;
  maxLength?: number;
  pattern?: string;              // Regex pattern
  customMessage?: string;

  // Type-specific
  emailFormat?: boolean;
  numberRange?: { min: number; max: number };
  fileTypes?: string[];          // MIME types or extensions
  dateRange?: { min: Date; max: Date };
}
```

---

## 3. Component Specifications

### Input Components

#### text_input
```typescript
{
  type: 'text_input',
  id: 'comp-xxx',
  fieldId: 'first_name',
  label: 'First Name',
  required: true,
  validation: {
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z\\s]+$' // Letters and spaces only
  },
  properties: {
    placeholder: 'Enter your first name',
    helpText: 'Your legal first name',
    maxLength: 50,
    disabled: false
  }
}
```

#### email_input
```typescript
{
  type: 'email_input',
  id: 'comp-xxx',
  fieldId: 'email',
  label: 'Email Address',
  required: true,
  validation: {
    emailFormat: true,
    customMessage: 'Enter a valid email address'
  },
  properties: {
    placeholder: 'user@example.com',
    helpText: 'We will never share your email',
    disabled: false
  }
}
```

#### number_input
```typescript
{
  type: 'number_input',
  id: 'comp-xxx',
  fieldId: 'age',
  label: 'Age',
  required: false,
  validation: {
    numberRange: { min: 0, max: 150 }
  },
  properties: {
    placeholder: 'Enter your age',
    min: 0,
    max: 150,
    step: 1,
    disabled: false
  }
}
```

#### textarea
```typescript
{
  type: 'textarea',
  id: 'comp-xxx',
  fieldId: 'message',
  label: 'Message',
  required: false,
  validation: {
    minLength: 10,
    maxLength: 1000
  },
  properties: {
    placeholder: 'Enter your message (10-1000 characters)',
    helpText: 'Maximum 1000 characters',
    rows: 5,
    maxLength: 1000,
    disabled: false
  }
}
```

---

### Selection Components

#### select (Single Dropdown)
```typescript
{
  type: 'select',
  id: 'comp-xxx',
  fieldId: 'country',
  label: 'Country',
  required: true,
  validation: {},
  properties: {
    placeholder: 'Select a country',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' }
    ],
    disabled: false,
    searchable: true
  }
}
```

#### multi_select
```typescript
{
  type: 'multi_select',
  id: 'comp-xxx',
  fieldId: 'interests',
  label: 'Interests',
  required: false,
  validation: {
    minLength: 1,     // At least 1 selected
    maxLength: 5      // At most 5 selected
  },
  properties: {
    placeholder: 'Select your interests',
    options: [
      { value: 'tech', label: 'Technology' },
      { value: 'sports', label: 'Sports' },
      { value: 'arts', label: 'Arts' }
    ],
    disabled: false,
    searchable: true
  }
}
```

#### checkbox (Group)
```typescript
{
  type: 'checkbox',
  id: 'comp-xxx',
  fieldId: 'terms_agreed',
  label: 'Agreements',
  required: true,
  validation: {},
  properties: {
    options: [
      { value: 'terms', label: 'I agree to terms and conditions' },
      { value: 'privacy', label: 'I agree to privacy policy' }
    ],
    orientation: 'vertical', // or 'horizontal'
    disabled: false
  }
}
```

#### radio_group
```typescript
{
  type: 'radio_group',
  id: 'comp-xxx',
  fieldId: 'experience_level',
  label: 'Experience Level',
  required: true,
  validation: {},
  properties: {
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' }
    ],
    orientation: 'vertical', // or 'horizontal'
    disabled: false
  }
}
```

---

### Special Components

#### date_picker
```typescript
{
  type: 'date_picker',
  id: 'comp-xxx',
  fieldId: 'date_of_birth',
  label: 'Date of Birth',
  required: true,
  validation: {
    dateRange: {
      min: new Date('1900-01-01'),
      max: new Date()
    }
  },
  properties: {
    placeholder: 'Select a date',
    format: 'MM/DD/YYYY',
    disabled: false,
    showTime: false // true for date+time
  }
}
```

#### file_upload
```typescript
{
  type: 'file_upload',
  id: 'comp-xxx',
  fieldId: 'resume',
  label: 'Upload Resume',
  required: false,
  validation: {
    fileTypes: ['.pdf', '.doc', '.docx'],
    maxFileSize: 5242880 // 5MB in bytes
  },
  properties: {
    accept: '.pdf,.doc,.docx',
    multiple: false,
    maxSize: '5MB',
    disabled: false
  }
}
```

---

### Layout Components

#### horizontal_layout
```typescript
{
  type: 'horizontal_layout',
  id: 'row-xxx',
  fieldId: '', // Not applicable for layout
  label: 'Row Layout',
  required: false,
  validation: {},
  children: [
    { /* Component 1 */ },
    { /* Component 2 */ }
  ],
  layoutConfig: {
    distribution: 'equal',    // 'equal', 'auto', 'custom'
    spacing: 'normal',        // 'tight', 'normal', 'loose'
    alignment: 'top'          // 'top', 'center', 'bottom'
  },
  properties: {
    gap: 16,                  // Spacing between children in pixels
    minWidth: 800,            // Minimum width before wrapping (responsive)
    maxChildren: 4            // Hard constraint
  }
}
```

---

### UI Components

#### section_divider
```typescript
{
  type: 'section_divider',
  id: 'comp-xxx',
  fieldId: '',
  label: 'Section Divider',
  required: false,
  validation: {},
  properties: {
    text: 'Personal Information', // Optional label
    style: 'solid',               // 'solid', 'dashed', 'dotted'
    thickness: 1
  }
}
```

#### button
```typescript
{
  type: 'button',
  id: 'comp-xxx',
  fieldId: '',
  label: 'Submit',
  required: false,
  validation: {},
  properties: {
    text: 'Submit Form',
    type: 'submit',          // 'submit', 'reset', 'button'
    variant: 'primary',      // 'primary', 'secondary', 'danger'
    size: 'medium',          // 'small', 'medium', 'large'
    disabled: false,
    fullWidth: false
  }
}
```

#### heading
```typescript
{
  type: 'heading',
  id: 'comp-xxx',
  fieldId: '',
  label: 'Form Title',
  required: false,
  validation: {},
  properties: {
    text: 'Contact Information',
    level: 'h2',              // 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    alignment: 'left'         // 'left', 'center', 'right'
  }
}
```

#### card
```typescript
{
  type: 'card',
  id: 'comp-xxx',
  fieldId: '',
  label: 'Card Container',
  required: false,
  validation: {},
  children: [
    { /* Child components */ }
  ],
  properties: {
    title: 'Card Title',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadow: 'medium'          // 'none', 'small', 'medium', 'large'
  }
}
```

---

## 4. Component Factory Implementation

### Factory Pattern

```typescript
// utils/componentFactory.ts
class ComponentFactory {
  private static defaultLabels: Record<ComponentType, string> = {
    text_input: 'Text Input',
    email_input: 'Email Address',
    password_input: 'Password',
    number_input: 'Number',
    textarea: 'Text Area',
    rich_text: 'Rich Text',
    select: 'Select',
    multi_select: 'Multi Select',
    checkbox: 'Checkboxes',
    radio_group: 'Radio Group',
    date_picker: 'Date Picker',
    file_upload: 'File Upload',
    signature: 'Signature',
    horizontal_layout: 'Row Layout',
    section_divider: 'Section Divider',
    button: 'Button',
    heading: 'Heading',
    card: 'Card'
  };

  private static defaultProperties: Record<ComponentType, Record<string, any>> = {
    text_input: {
      placeholder: 'Enter text...',
      maxLength: 100
    },
    email_input: {
      placeholder: 'user@example.com'
    },
    password_input: {
      placeholder: '••••••••'
    },
    number_input: {
      min: 0,
      max: 100
    },
    textarea: {
      placeholder: 'Enter text...',
      rows: 4,
      maxLength: 500
    },
    select: {
      placeholder: 'Select an option...',
      options: [],
      searchable: true
    },
    radio_group: {
      options: [],
      orientation: 'vertical'
    },
    checkbox: {
      options: [],
      orientation: 'vertical'
    },
    date_picker: {
      placeholder: 'Select a date...',
      format: 'MM/DD/YYYY'
    },
    file_upload: {
      accept: '*/*',
      multiple: false
    },
    button: {
      text: 'Click me',
      type: 'button',
      variant: 'primary'
    },
    heading: {
      text: 'Heading',
      level: 'h2'
    },
    section_divider: {
      style: 'solid'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 8
    },
    horizontal_layout: {
      gap: 16,
      maxChildren: 4
    },
    multi_select: {
      placeholder: 'Select options...',
      options: [],
      searchable: true
    },
    password_input: {
      placeholder: '••••••••'
    },
    rich_text: {
      placeholder: 'Enter rich text...'
    },
    signature: {
      placeholder: 'Sign here...'
    }
  };

  /**
   * Create a new component with default configuration
   */
  static create(type: ComponentType): FormComponentData {
    const id = `${type}-${generateUniqueId()}`;
    const fieldId = `${type}_${Date.now()}`;

    const component: FormComponentData = {
      type,
      id,
      fieldId: type === 'horizontal_layout' || type.startsWith('section_') ||
              type === 'card' || type === 'button' || type === 'heading' ? '' : fieldId,
      label: this.defaultLabels[type] || type,
      required: this.shouldBeRequiredByDefault(type),
      validation: this.getDefaultValidation(type),
      properties: { ...this.defaultProperties[type] }
    };

    // Special handling for horizontal layout
    if (type === 'horizontal_layout') {
      (component as any).children = [];
      (component as any).layoutConfig = {
        distribution: 'equal',
        spacing: 'normal',
        alignment: 'top'
      };
    }

    return component;
  }

  /**
   * Create a component from template data
   */
  static fromTemplate(data: Partial<FormComponentData>): FormComponentData {
    const type = data.type as ComponentType;
    const base = this.create(type);

    return {
      ...base,
      ...data,
      id: data.id || base.id, // Keep original ID if provided
      fieldId: data.fieldId || base.fieldId
    };
  }

  /**
   * Determine if component should be required by default
   */
  private static shouldBeRequiredByDefault(type: ComponentType): boolean {
    // UI and layout components are never required
    const nonRequiredTypes: ComponentType[] = [
      'section_divider',
      'heading',
      'card',
      'button',
      'horizontal_layout'
    ];
    return !nonRequiredTypes.includes(type);
  }

  /**
   * Get component-specific default validation rules
   */
  private static getDefaultValidation(type: ComponentType): ValidationRules {
    switch (type) {
      case 'text_input':
        return { minLength: 1, maxLength: 100 };
      case 'email_input':
        return { emailFormat: true };
      case 'number_input':
        return { numberRange: { min: 0, max: 1000 } };
      case 'textarea':
        return { minLength: 0, maxLength: 500 };
      default:
        return {};
    }
  }

  /**
   * Clone a component (for duplication)
   */
  static duplicate(component: FormComponentData): FormComponentData {
    const cloned = JSON.parse(JSON.stringify(component));
    cloned.id = `${component.type}-${generateUniqueId()}`;
    if (cloned.fieldId) {
      cloned.fieldId = `${component.type}_${Date.now()}`;
    }
    return cloned;
  }

  /**
   * Validate component structure
   */
  static validate(component: FormComponentData): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!component.type) errors.push('Component type is required');
    if (!component.id) errors.push('Component ID is required');
    if (!component.label) errors.push('Component label is required');

    // Type-specific validation
    if (component.type === 'horizontal_layout') {
      if (!Array.isArray(component.children)) {
        errors.push('Horizontal layout must have children array');
      }
      if ((component.children || []).length > 4) {
        errors.push('Horizontal layout cannot exceed 4 children');
      }
    }

    // Validation rules
    if (component.validation && typeof component.validation !== 'object') {
      errors.push('Validation rules must be an object');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export for use
export default ComponentFactory;
export { ComponentType, FormComponentData };
```

---

## 5. Component Registry

### Available Components by Domain

```typescript
const DOMAIN_COMPONENTS: Record<'forms' | 'surveys' | 'workflows', ComponentType[]> = {
  forms: [
    // Input
    'text_input', 'email_input', 'password_input', 'number_input', 'textarea', 'rich_text',
    // Selection
    'select', 'multi_select', 'checkbox', 'radio_group',
    // Special
    'date_picker', 'file_upload', 'signature',
    // Layout
    'horizontal_layout',
    // UI
    'section_divider', 'button', 'heading', 'card'
  ],

  surveys: [
    // Input - Limited to question types
    'text_input', 'textarea', 'rich_text',
    // Selection
    'select', 'radio_group', 'checkbox',
    // Special - Only date picker
    'date_picker',
    // Layout
    'horizontal_layout',
    // UI - Only for structure
    'section_divider', 'heading'
  ],

  workflows: [
    // Input - Basic fields only
    'text_input', 'textarea',
    // Selection
    'select', 'checkbox',
    // Layout
    'horizontal_layout',
    // UI - Action-focused
    'button', 'heading', 'card'
  ]
};

/**
 * Check if component is allowed in domain
 */
function isComponentAllowedInDomain(
  componentType: ComponentType,
  domain: 'forms' | 'surveys' | 'workflows'
): boolean {
  return DOMAIN_COMPONENTS[domain].includes(componentType);
}

/**
 * Get all allowed components for domain
 */
function getAllowedComponentsForDomain(domain: 'forms' | 'surveys' | 'workflows'): ComponentType[] {
  return DOMAIN_COMPONENTS[domain];
}
```

---

## 6. Component Rendering System

### Renderer Interface

```typescript
interface ComponentRenderer {
  render(component: FormComponentData): React.ReactElement;
  renderPreview(component: FormComponentData): React.ReactElement;
}

// Example: TextInputRenderer
class TextInputRenderer implements ComponentRenderer {
  render(component: FormComponentData): React.ReactElement {
    const textComponent = component as any;

    return (
      <div key={component.id} className="form-group">
        <label htmlFor={component.fieldId}>
          {component.label}
          {component.required && <span className="required">*</span>}
        </label>
        <input
          id={component.fieldId}
          type="text"
          placeholder={textComponent.properties?.placeholder}
          maxLength={textComponent.properties?.maxLength}
          disabled={textComponent.properties?.disabled || false}
          aria-describedby={`help-${component.id}`}
          aria-required={component.required}
        />
        {textComponent.properties?.helpText && (
          <small id={`help-${component.id}`}>{textComponent.properties.helpText}</small>
        )}
      </div>
    );
  }

  renderPreview(component: FormComponentData): React.ReactElement {
    // Same as render for this component type
    return this.render(component);
  }
}

// Component Registry
const rendererRegistry: Record<ComponentType, ComponentRenderer> = {
  text_input: new TextInputRenderer(),
  email_input: new EmailInputRenderer(),
  // ... etc
};
```

---

## 7. Component Properties Editor

### Properties Available per Component Type

| Component | Editable Properties |
|-----------|-------------------|
| text_input | label, placeholder, maxLength, helpText, disabled |
| email_input | label, placeholder, helpText, disabled |
| number_input | label, min, max, step, helpText, disabled |
| textarea | label, placeholder, rows, maxLength, helpText, disabled |
| select | label, options, placeholder, searchable, helpText, disabled |
| radio_group | label, options, orientation, helpText, disabled |
| checkbox | label, options, orientation, helpText, disabled |
| date_picker | label, format, min, max, helpText, disabled |
| file_upload | label, accept, maxSize, multiple, helpText, disabled |
| button | text, type, variant, size, fullWidth, disabled |
| heading | text, level, alignment |
| section_divider | text, style, thickness |
| card | title, backgroundColor, padding, shadow |

---

## 8. Component Validation Rules

### Per-Component Validation Options

```typescript
const VALIDATION_OPTIONS_BY_COMPONENT: Record<ComponentType, string[]> = {
  text_input: ['required', 'minLength', 'maxLength', 'pattern'],
  email_input: ['required', 'emailFormat', 'customMessage'],
  number_input: ['required', 'min', 'max', 'step'],
  textarea: ['required', 'minLength', 'maxLength'],
  select: ['required'],
  multi_select: ['required', 'minSelected', 'maxSelected'],
  checkbox: ['required', 'minSelected'],
  radio_group: ['required'],
  date_picker: ['required', 'minDate', 'maxDate'],
  file_upload: ['required', 'fileTypes', 'maxFileSize'],
  // UI/Layout components have no validation
  section_divider: [],
  button: [],
  heading: [],
  card: [],
  horizontal_layout: [],
  password_input: ['required', 'minLength', 'pattern'],
  signature: ['required'],
  rich_text: ['required', 'minLength', 'maxLength']
};
```

---

**This component system provides a complete, extensible foundation for all form builder components.**
