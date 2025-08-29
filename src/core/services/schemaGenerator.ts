import type { FormComponentData } from "../../types";

interface JsonSchemaProperty {
  type: string;
  format?: string;
  enum?: string[];
  pattern?: string;
  title?: string;
  description?: string;
  items?: {
    type: string;
    enum?: string[];
  };
  minimum?: number;
  maximum?: number;
}

interface JsonSchema {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
  required: string[];
  title?: string;
  description?: string;
}

// Extended interface for components with validation
interface FormComponentWithValidation extends FormComponentData {
  validation?: "none" | "email" | "number" | "custom";
  customValidation?: string;
}

export class SchemaGenerator {
  static generateSchema(
    formName: string, 
    components: FormComponentData[]
  ): JsonSchema {
    const schema: JsonSchema = {
      type: "object",
      properties: {},
      required: [],
      title: formName,
      description: `Generated JSON Schema for ${formName}`
    };

    components.forEach(component => {
      const fieldId = component.fieldId || component.id;
      if (fieldId) {
        const propertySchema = this.generatePropertySchema(component);
        
        // Skip null properties (like section dividers)
        if (propertySchema) {
          schema.properties[fieldId] = propertySchema;
          
          if (component.required) {
            schema.required.push(fieldId);
          }
        }
      }
    });

    return schema;
  }

  private static generatePropertySchema(component: FormComponentData): JsonSchemaProperty | null {
    const baseProperty: JsonSchemaProperty = {
      type: this.getBaseType(component.type),
      title: component.label,
      description: component.helpText || undefined
    };

    // Add type-specific properties
    switch (component.type) {
      case "select":
      case "radio_group":
        if (component.options && component.options.length > 0) {
          baseProperty.enum = component.options;
        }
        break;

      case "multi_select":
        baseProperty.type = "array";
        if (component.options && component.options.length > 0) {
          baseProperty.items = {
            type: "string",
            enum: component.options
          };
        } else {
          baseProperty.items = {
            type: "string"
          };
        }
        break;

      case "checkbox":
        if (component.options && component.options.length > 1) {
          // Multiple checkboxes - array of selected options
          baseProperty.type = "array";
          baseProperty.items = {
            type: "string",
            enum: component.options
          };
        } else {
          // Single checkbox - boolean
          baseProperty.type = "boolean";
        }
        break;

      case "date_picker":
        baseProperty.format = "date";
        break;

      case "file_upload":
        baseProperty.format = "binary";
        break;

      case "number_input":
        baseProperty.type = "number";
        if (component.min !== undefined) {
          baseProperty.minimum = component.min;
        }
        if (component.max !== undefined) {
          baseProperty.maximum = component.max;
        }
        break;

      case "email_input":
        baseProperty.format = "email";
        break;

      case "password_input":
        baseProperty.format = "password";
        break;

      case "signature":
        baseProperty.format = "data-url";
        baseProperty.description = "Base64 encoded signature image";
        break;

      case "section_divider":
        // Section dividers don't generate form fields in JSON schema
        return null;
    }

    // Add validation for extended components
    const extendedComponent = component as FormComponentWithValidation;
    if (extendedComponent.validation && extendedComponent.validation !== "none") {
      switch (extendedComponent.validation) {
        case "email":
          baseProperty.format = "email";
          break;
        
        case "number":
          baseProperty.type = "number";
          break;
        
        case "custom":
          if (extendedComponent.customValidation) {
            baseProperty.pattern = extendedComponent.customValidation;
          }
          break;
      }
    }

    return baseProperty;
  }

  private static getBaseType(componentType: string): string {
    switch (componentType) {
      case "checkbox":
        return "boolean";
      case "number_input":
        return "number";
      default:
        return "string";
    }
  }

  static validateComponent(component: FormComponentData, value: any): string | null {
    // Basic required validation
    if (component.required) {
      if (component.type === "multi_select" || (component.type === "checkbox" && Array.isArray(value))) {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return `${component.label} is required`;
        }
      } else if (!value || value === "") {
        return `${component.label} is required`;
      }
    }

    if (!value) return null;

    // Type-specific validation
    switch (component.type) {
      case "number_input":
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return `${component.label} must be a valid number`;
        }
        if (component.min !== undefined && numValue < component.min) {
          return `${component.label} must be at least ${component.min}`;
        }
        if (component.max !== undefined && numValue > component.max) {
          return `${component.label} must not exceed ${component.max}`;
        }
        break;

      case "multi_select":
        if (!Array.isArray(value)) {
          return `${component.label} must be an array of selections`;
        }
        break;

      case "email_input":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return `${component.label} must be a valid email address`;
        }
        break;
    }

    // General validation rules for extended components
    const extendedComponent = component as FormComponentWithValidation;
    switch (extendedComponent.validation) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return `${component.label} must be a valid email address`;
        }
        break;

      case "number":
        if (isNaN(Number(value))) {
          return `${component.label} must be a valid number`;
        }
        break;

      case "custom":
        if (extendedComponent.customValidation) {
          const customRegex = new RegExp(extendedComponent.customValidation);
          if (!customRegex.test(value)) {
            return `${component.label} does not match the required format`;
          }
        }
        break;
    }

    return null;
  }

  static generateFormInstance(schema: JsonSchema, data: Record<string, any>) {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    schema.required.forEach(fieldId => {
      if (!data[fieldId] || data[fieldId] === "") {
        const property = schema.properties[fieldId];
        errors[fieldId] = `${property.title || fieldId} is required`;
      }
    });

    // Validate field formats
    Object.keys(schema.properties).forEach(fieldId => {
      const property = schema.properties[fieldId];
      const value = data[fieldId];
      
      if (value && property.format) {
        switch (property.format) {
          case "email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors[fieldId] = `${property.title || fieldId} must be a valid email`;
            }
            break;
          
          case "date":
            if (isNaN(Date.parse(value))) {
              errors[fieldId] = `${property.title || fieldId} must be a valid date`;
            }
            break;
        }
      }
      
      if (value && property.pattern) {
        const regex = new RegExp(property.pattern);
        if (!regex.test(value)) {
          errors[fieldId] = `${property.title || fieldId} does not match required format`;
        }
      }
    });

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      data
    };
  }
}
