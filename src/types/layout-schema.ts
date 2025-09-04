/**
 * JSON Schema Definition for Form Builder Layout Structure
 * 
 * This defines the complete schema format for forms with advanced layout capabilities
 * including horizontal/vertical containers, positioning, and styling.
 */

import type { FormComponentData } from "../types";

export interface FormLayoutSchema {
  $schema: string;
  version: string;
  metadata: FormMetadata;
  layout: LayoutStructure;
  validation: ValidationSchema;
  styling: StyleSchema;
}

export interface FormMetadata {
  id: string;
  name: string;
  description?: string;
  templateType: "assessment" | "survey" | "application" | "feedback" | "registration" | "other";
  created: string; // ISO date string
  modified: string; // ISO date string
  version: string;
  author?: string;
  tags?: string[];
}

export interface LayoutStructure {
  type: "page" | "container" | "component";
  id: string;
  properties: LayoutProperties;
  children?: LayoutStructure[];
}

export interface LayoutProperties {
  // Container properties
  direction?: "horizontal" | "vertical";
  distribution?: "equal" | "auto" | "custom";
  gap?: string; // CSS gap value (e.g., "12px", "1rem")
  alignment?: {
    horizontal?: "left" | "center" | "right" | "stretch";
    vertical?: "top" | "center" | "bottom" | "stretch";
  };
  
  // Component properties
  componentType?: string;
  label?: string;
  fieldId?: string;
  required?: boolean;
  placeholder?: string;
  
  // Layout positioning
  position?: {
    row?: number;
    column?: number;
    rowSpan?: number;
    columnSpan?: number;
  };
  
  // Size constraints
  size?: {
    width?: string | number; // CSS width or percentage
    height?: string | number; // CSS height or percentage
    minWidth?: string | number;
    maxWidth?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
  };
  
  // Spacing
  margin?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  } | string; // shorthand
  
  padding?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  } | string; // shorthand;
  
  // Component-specific properties
  options?: string[]; // for select, radio, checkbox
  validation?: ComponentValidation;
  richTextConfig?: RichTextConfiguration;
  fileUploadConfig?: FileUploadConfiguration;
}

export interface ComponentValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string; // regex pattern
  customRules?: ValidationRule[];
}

export interface ValidationRule {
  type: "regex" | "custom" | "range" | "length";
  value?: string | number;
  message: string;
  condition?: string; // JavaScript condition
}

export interface RichTextConfiguration {
  toolbar?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    lists?: boolean;
    headings?: boolean;
    links?: boolean;
    images?: boolean;
    customButtons?: CustomToolbarButton[];
  };
  height?: string;
  maxLength?: number;
  allowedTags?: string[];
  sanitizeHTML?: boolean;
}

export interface CustomToolbarButton {
  label: string;
  command: string;
  icon?: string;
  tooltip?: string;
}

export interface FileUploadConfiguration {
  allowedTypes?: string[];
  maxSize?: number; // in bytes
  multiple?: boolean;
  acceptedMimeTypes?: string[];
}

export interface ValidationSchema {
  jsonSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
  customValidators?: CustomValidator[];
}

export interface CustomValidator {
  fieldId: string;
  type: "async" | "sync";
  function: string; // JavaScript function as string
  message: string;
  dependencies?: string[]; // other field IDs this depends on
}

export interface StyleSchema {
  theme?: "light" | "dark" | "custom";
  colors?: {
    primary?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    error?: string;
    text?: string;
    background?: string;
    border?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: {
      xs?: string;
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
    };
    fontWeight?: {
      normal?: string;
      medium?: string;
      semibold?: string;
      bold?: string;
    };
  };
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  borderRadius?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  customCSS?: string;
}

/**
 * Example JSON Schema Structure:
 * 
 * ```json
 * {
 *   "$schema": "https://formbuilder.schema.json/v1",
 *   "version": "1.0.0",
 *   "metadata": {
 *     "id": "form-001",
 *     "name": "User Registration Form",
 *     "templateType": "registration",
 *     "created": "2024-01-01T00:00:00Z",
 *     "modified": "2024-01-02T12:00:00Z",
 *     "version": "1.0.0"
 *   },
 *   "layout": {
 *     "type": "page",
 *     "id": "page-1",
 *     "properties": {
 *       "direction": "vertical",
 *       "gap": "24px"
 *     },
 *     "children": [
 *       {
 *         "type": "container",
 *         "id": "header-section",
 *         "properties": {
 *           "direction": "horizontal",
 *           "distribution": "equal",
 *           "gap": "16px"
 *         },
 *         "children": [
 *           {
 *             "type": "component",
 *             "id": "first-name",
 *             "properties": {
 *               "componentType": "text_input",
 *               "label": "First Name",
 *               "fieldId": "firstName",
 *               "required": true,
 *               "placeholder": "Enter your first name",
 *               "size": {
 *                 "width": "100%"
 *               },
 *               "validation": {
 *                 "required": true,
 *                 "minLength": 2,
 *                 "maxLength": 50
 *               }
 *             }
 *           },
 *           {
 *             "type": "component",
 *             "id": "last-name",
 *             "properties": {
 *               "componentType": "text_input",
 *               "label": "Last Name",
 *               "fieldId": "lastName",
 *               "required": true,
 *               "placeholder": "Enter your last name",
 *               "size": {
 *                 "width": "100%"
 *               }
 *             }
 *           }
 *         ]
 *       },
 *       {
 *         "type": "component",
 *         "id": "bio",
 *         "properties": {
 *           "componentType": "rich_text",
 *           "label": "Biography",
 *           "fieldId": "biography",
 *           "required": false,
 *           "richTextConfig": {
 *             "toolbar": {
 *               "bold": true,
 *               "italic": true,
 *               "underline": true,
 *               "lists": true,
 *               "headings": true
 *             },
 *             "height": "200px",
 *             "maxLength": 1000
 *           }
 *         }
 *       }
 *     ]
 *   },
 *   "validation": {
 *     "jsonSchema": {
 *       "type": "object",
 *       "properties": {
 *         "firstName": {
 *           "type": "string",
 *           "minLength": 2,
 *           "maxLength": 50
 *         },
 *         "lastName": {
 *           "type": "string",
 *           "minLength": 2,
 *           "maxLength": 50
 *         },
 *         "biography": {
 *           "type": "string",
 *           "maxLength": 1000
 *         }
 *       },
 *       "required": ["firstName", "lastName"]
 *     }
 *   },
 *   "styling": {
 *     "theme": "light",
 *     "colors": {
 *       "primary": "#3b82f6",
 *       "secondary": "#6b7280",
 *       "success": "#10b981",
 *       "error": "#ef4444"
 *     }
 *   }
 * }
 * ```
 */

// Utility type for converting FormComponentData to LayoutStructure
export type FormComponentDataToLayout<T extends FormComponentData> = {
  type: T['type'] extends 'horizontal_layout' | 'vertical_layout' ? 'container' : 'component';
  id: T['id'];
  properties: LayoutProperties & {
    componentType: T['type'];
    label: T['label'];
    fieldId: T['fieldId'];
    required: T['required'];
    placeholder: T['placeholder'];
    options: T['options'];
  };
  children?: T['children'] extends FormComponentData[] 
    ? FormComponentDataToLayout<T['children'][number]>[] 
    : undefined;
};

// Helper function to convert FormComponentData to LayoutSchema
export function convertToLayoutSchema(
  components: FormComponentData[],
  metadata: Partial<FormMetadata>
): FormLayoutSchema {
  const now = new Date().toISOString();
  
  return {
    $schema: "https://formbuilder.schema.json/v1",
    version: "1.0.0",
    metadata: {
      id: metadata.id || `form-${Date.now()}`,
      name: metadata.name || "Untitled Form",
      templateType: metadata.templateType || "other",
      created: metadata.created || now,
      modified: now,
      version: metadata.version || "1.0.0",
      ...metadata
    },
    layout: {
      type: "page",
      id: "root",
      properties: {
        direction: "vertical",
        gap: "16px"
      },
      children: components.map(convertComponentToLayout)
    },
    validation: generateValidationSchema(components),
    styling: {
      theme: "light",
      colors: {
        primary: "#3b82f6",
        secondary: "#6b7280", 
        success: "#10b981",
        error: "#ef4444"
      }
    }
  };
}

function convertComponentToLayout(component: FormComponentData): LayoutStructure {
  const isContainer = component.type === 'horizontal_layout' || component.type === 'vertical_layout';
  
  return {
    type: isContainer ? "container" : "component",
    id: component.id,
    properties: {
      ...(isContainer && {
        direction: component.type === 'horizontal_layout' ? 'horizontal' : 'vertical',
        distribution: 'equal',
        gap: '12px'
      }),
      ...(!isContainer && {
        componentType: component.type,
        label: component.label,
        fieldId: component.fieldId,
        required: component.required,
        placeholder: component.placeholder,
        options: component.options?.map(option => 
          typeof option === 'string' ? option : option.value
        ),
        validation: {
          required: component.required,
          ...(component.min !== undefined && { min: component.min }),
          ...(component.max !== undefined && { max: component.max })
        }
      })
    },
    ...(component.children && {
      children: component.children.map(convertComponentToLayout)
    })
  };
}

function generateValidationSchema(components: FormComponentData[]): ValidationSchema {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  
  const processComponent = (component: FormComponentData) => {
    if (component.fieldId && component.type !== 'horizontal_layout' && component.type !== 'vertical_layout') {
      const fieldSchema: Record<string, unknown> = {};
      
      // Set base type
      switch (component.type) {
        case 'text_input':
        case 'textarea':
        case 'rich_text':
          fieldSchema.type = 'string';
          break;
        case 'number_input':
          fieldSchema.type = 'number';
          if (component.min !== undefined) fieldSchema.minimum = component.min;
          if (component.max !== undefined) fieldSchema.maximum = component.max;
          break;
        case 'select':
        case 'radio_group':
          fieldSchema.type = 'string';
          if (component.options) fieldSchema.enum = component.options;
          break;
        case 'checkbox':
        case 'multi_select':
          fieldSchema.type = 'array';
          fieldSchema.items = { type: 'string' };
          if (component.options) {
            (fieldSchema.items as Record<string, unknown>).enum = component.options;
          }
          break;
        case 'date_picker':
          fieldSchema.type = 'string';
          fieldSchema.format = 'date';
          break;
        case 'file_upload':
          fieldSchema.type = 'string';
          fieldSchema.format = 'binary';
          break;
      }
      
      properties[component.fieldId] = fieldSchema;
      
      if (component.required) {
        required.push(component.fieldId);
      }
    }
    
    // Process children recursively
    if (component.children) {
      component.children.forEach(processComponent);
    }
  };
  
  components.forEach(processComponent);
  
  return {
    jsonSchema: {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
      additionalProperties: false
    }
  };
}