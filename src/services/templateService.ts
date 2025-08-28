
import type { FormComponentData, FormTemplate, FormTemplateType, FormPage } from "../types";
import { SchemaGenerator } from "./schemaGenerator";
import { convertToLayoutSchema } from '../types/layout-schema';

export const templateService = {
  save: (
    templateName: string, 
    components: FormComponentData[], 
    templateType: FormTemplateType = "assessment", 
    pages: FormPage[], 
    existingTemplateId?: string
  ) => {
    const template: FormTemplate = {
      templateId: existingTemplateId || Date.now().toString(),
      name: templateName,
      type: templateType,
      fields: components,
      pages: pages,
      createdDate: existingTemplateId ? 
        JSON.parse(localStorage.getItem('formTemplates') || '[]')
          .find((t: FormTemplate) => t.templateId === existingTemplateId)?.createdDate || new Date().toISOString()
        : new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      jsonSchema: generateJSONSchema(components, pages)
    };

    const templates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
    const existingIndex = templates.findIndex((t: FormTemplate) => t.templateId === template.templateId);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem('formTemplates', JSON.stringify(templates));
    return template;
  },

  exportJSON: (templateName: string, components: FormComponentData[], templateType: FormTemplateType = "assessment", pages: FormPage[]) => {
    const exportData = {
      template: {
        name: templateName,
        type: templateType,
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      },
      components: components.map(component => ({
        ...component,
        layout: {
          ...component.layout,
          // Ensure layout properties are properly exported
          width: component.layout?.width || 'auto',
          height: component.layout?.height || 'auto',
          direction: component.layout?.direction || 'vertical',
          alignment: component.layout?.alignment || 'start'
        }
      })),
      pages: pages.map(page => ({
        ...page,
        layout: {
          direction: page.layout?.direction || 'vertical',
          gap: page.layout?.gap || 'medium',
          padding: page.layout?.padding || 'medium'
        }
      })),
      styling: {
        layout: {
          horizontalSpacing: 'var(--space-3)',
          verticalSpacing: 'var(--space-4)',
          containerPadding: 'var(--space-2)',
          gridGap: 'var(--space-2)'
        },
        responsive: {
          breakpoints: {
            mobile: '768px',
            tablet: '1024px',
            desktop: '1280px'
          }
        }
      },
      jsonSchema: generateJSONSchema(components, pages)
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportLayoutSchema: (templateName: string, components: FormComponentData[], templateType: FormTemplateType = "assessment", pages: FormPage[]) => {
    // Convert all pages to the new layout schema format
    const pageLayouts = pages.map((page, index) => convertToLayoutSchema(
      page.components, 
      {
        id: `page-${index + 1}`,
        name: page.title,
        templateType,
        description: `Page ${index + 1} of ${templateName}`
      }
    ));

    // If no pages, create a single page with all components
    const layoutSchemas = pageLayouts.length > 0 
      ? pageLayouts 
      : [convertToLayoutSchema(components, {
          id: 'single-page',
          name: templateName,
          templateType,
          description: `Complete form layout for ${templateName}`
        })];

    // Multi-page form schema
    const multiPageSchema = {
      $schema: "https://formbuilder.schema.json/v1",
      version: "1.0.0",
      metadata: {
        id: `form-${Date.now()}`,
        name: templateName,
        templateType,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: "1.0.0",
        multiPage: true,
        totalPages: layoutSchemas.length
      },
      pages: layoutSchemas,
      globalStyling: {
        theme: "light",
        colors: {
          primary: "#3b82f6",
          secondary: "#6b7280",
          success: "#10b981",
          warning: "#f59e0b", 
          error: "#ef4444",
          text: "#374151",
          background: "#ffffff",
          border: "#d1d5db"
        },
        typography: {
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: {
            xs: "0.75rem",
            sm: "0.875rem", 
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem"
          }
        },
        spacing: {
          xs: "0.25rem",
          sm: "0.5rem",
          md: "1rem", 
          lg: "1.5rem",
          xl: "2rem"
        },
        layout: {
          maxWidth: "800px",
          containerPadding: "2rem",
          sectionGap: "2rem",
          fieldGap: "1rem"
        }
      }
    };

    const fileName = `${templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_layout_schema.json`;
    const blob = new Blob([JSON.stringify(multiPageSchema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Exported Layout Schema:', multiPageSchema);
    return multiPageSchema;
  },

  getTemplates: (): FormTemplate[] => {
    return JSON.parse(localStorage.getItem('formTemplates') || '[]');
  },

  getTemplate: (templateId: string): FormTemplate | null => {
    const templates = templateService.getTemplates();
    return templates.find(t => t.templateId === templateId) || null;
  },

  validateFormData: (templateId: string, formData: Record<string, any>) => {
    const template = templateService.getTemplate(templateId);
    if (!template || !template.jsonSchema) {
      return { valid: false, errors: { _form: "Template not found or invalid" }, data: formData };
    }
    
    return SchemaGenerator.generateFormInstance(template.jsonSchema as any, formData);
  },

  loadFromJSON: (jsonData: string): { template?: FormTemplate, components?: FormComponentData[], pages?: FormPage[], error?: string } => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.components && Array.isArray(data.components)) {
        return {
          components: data.components,
          template: data.template,
          pages: data.pages || [{ id: '1', title: 'Page 1', components: data.components }]
        };
      }
      
      return { error: 'Invalid JSON format' };
    } catch (error) {
      return { error: 'Failed to parse JSON' };
    }
  },

  preview: (templateName: string, components: FormComponentData[]) => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Form Preview - ${templateName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .form-container { max-width: 600px; margin: 0 auto; }
            .form-field { margin-bottom: 20px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, textarea, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
            .checkbox-group, .radio-group { display: flex; flex-direction: column; gap: 5px; }
            .checkbox-item, .radio-item { display: flex; align-items: center; gap: 5px; }
            .checkbox-item input, .radio-item input { width: auto; }
          </style>
        </head>
        <body>
          <div class="form-container">
            <h1>${templateName || 'Form Preview'}</h1>
            <form>
              ${components.map(component => {
                switch (component.type) {
                  case 'text_input':
                    return `<div class="form-field">
                      <label>${component.label}${component.required ? ' *' : ''}</label>
                      <input type="text" placeholder="${component.placeholder || ''}" ${component.required ? 'required' : ''}>
                    </div>`;
                  case 'textarea':
                    return `<div class="form-field">
                      <label>${component.label}${component.required ? ' *' : ''}</label>
                      <textarea placeholder="${component.placeholder || ''}" ${component.required ? 'required' : ''}></textarea>
                    </div>`;
                  case 'select':
                    return `<div class="form-field">
                      <label>${component.label}${component.required ? ' *' : ''}</label>
                      <select ${component.required ? 'required' : ''}>
                        <option value="">Choose an option</option>
                        ${(component.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                      </select>
                    </div>`;
                  case 'checkbox':
                    return `<div class="form-field">
                      <div class="checkbox-item">
                        <input type="checkbox" id="${component.id}" ${component.required ? 'required' : ''}>
                        <label for="${component.id}">${component.label}${component.required ? ' *' : ''}</label>
                      </div>
                    </div>`;
                  case 'radio_group':
                    return `<div class="form-field">
                      <label>${component.label}${component.required ? ' *' : ''}</label>
                      <div class="radio-group">
                        ${(component.options || []).map((opt, idx) => 
                          `<div class="radio-item">
                            <input type="radio" id="${component.id}_${idx}" name="${component.id}" value="${opt}" ${component.required ? 'required' : ''}>
                            <label for="${component.id}_${idx}">${opt}</label>
                          </div>`
                        ).join('')}
                      </div>
                    </div>`;
                  case 'date_picker':
                    return `<div class="form-field">
                      <label>${component.label}${component.required ? ' *' : ''}</label>
                      <input type="date" ${component.required ? 'required' : ''}>
                    </div>`;
                  case 'file_upload':
                    return `<div class="form-field">
                      <label>${component.label}${component.required ? ' *' : ''}</label>
                      <input type="file" ${component.acceptedFileTypes ? `accept="${component.acceptedFileTypes}"` : ''} ${component.required ? 'required' : ''}>
                    </div>`;
                  default:
                    return '';
                }
              }).join('')}
              <button type="submit" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
            </form>
          </div>
        </body>
        </html>
      `;
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
  },
};

function generateJSONSchema(components: FormComponentData[], pages: FormPage[]) {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  const processComponents = (comps: FormComponentData[]) => {
    comps.forEach(component => {
      if (component.type !== 'section_divider' && component.type !== 'horizontal_layout' && component.type !== 'vertical_layout') {
        // Ensure fieldId exists before using it as a key
        const fieldId = component.fieldId || component.id;
        properties[fieldId] = getSchemaForComponent(component);
        if (component.required) {
          required.push(fieldId);
        }
      }
      
      if (component.children) {
        processComponents(component.children);
      }
    });
  };

  pages.forEach(page => processComponents(page.components));

  return {
    type: 'object',
    properties,
    required
  };
}

function getSchemaForComponent(component: FormComponentData) {
  switch (component.type) {
    case 'text_input':
    case 'textarea':
      return { type: 'string' };
    case 'number_input':
      return { 
        type: 'number',
        minimum: component.min,
        maximum: component.max
      };
    case 'select':
    case 'radio_group':
      return {
        type: 'string',
        enum: component.options
      };
    case 'multi_select':
    case 'checkbox':
      return {
        type: 'array',
        items: {
          type: 'string',
          enum: component.options
        }
      };
    case 'date_picker':
      return {
        type: 'string',
        format: 'date'
      };
    case 'file_upload':
      return {
        type: 'string',
        format: 'binary'
      };
    default:
      return { type: 'string' };
  }
}
