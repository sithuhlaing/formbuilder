
import type { FormComponentData, FormTemplate, FormTemplateType } from "../components/types";
import { SchemaGenerator } from "./schemaGenerator";

export const templateService = {
  save: (templateName: string, components: FormComponentData[], templateType: FormTemplateType = "assessment") => {
    const jsonSchema = SchemaGenerator.generateSchema(templateName, components);
    
    const template: FormTemplate = {
      templateId: Date.now().toString(),
      name: templateName,
      type: templateType,
      createdDate: new Date().toISOString(),
      fields: components,
      jsonSchema
    };
    
    const savedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
    savedTemplates.push(template);
    localStorage.setItem('formTemplates', JSON.stringify(savedTemplates));
    
    return template;
  },

  exportJSON: (templateName: string, components: FormComponentData[], templateType: FormTemplateType = "assessment") => {
    const jsonSchema = SchemaGenerator.generateSchema(templateName, components);
    
    const template: FormTemplate = {
      templateId: Date.now().toString(),
      name: templateName,
      type: templateType,
      createdDate: new Date().toISOString(),
      fields: components,
      jsonSchema
    };
    
    const exportData = {
      template,
      schema: jsonSchema,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${templateName || 'form-template'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

  loadFromJSON: (jsonData: string): { template?: FormTemplate, components?: FormComponentData[], error?: string } => {
    try {
      const parsed = JSON.parse(jsonData);
      
      // Handle different JSON formats
      let template: FormTemplate | undefined;
      let components: FormComponentData[] | undefined;
      
      // Format 1: Direct FormTemplate
      if (parsed.templateId && parsed.fields) {
        template = parsed as FormTemplate;
        components = parsed.fields;
      }
      // Format 2: Export format with template wrapper
      else if (parsed.template && parsed.template.templateId && parsed.template.fields) {
        template = parsed.template;
        components = parsed.template.fields;
      }
      // Format 3: Just components array
      else if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].type) {
        components = parsed as FormComponentData[];
      }
      // Format 4: Schema with components
      else if (parsed.components && Array.isArray(parsed.components)) {
        components = parsed.components;
      }
      else {
        return { error: "Invalid JSON format. Expected a form template, components array, or exported template." };
      }
      
      // Validate components if found
      if (components) {
        const validComponents = components.filter(comp => 
          comp.id && comp.type && comp.label && 
          ['text_input', 'textarea', 'select', 'checkbox', 'radio_group', 'date_picker', 'file_upload'].includes(comp.type)
        );
        
        if (validComponents.length === 0) {
          return { error: "No valid components found in JSON." };
        }
        
        return { template, components: validComponents };
      }
      
      return { error: "No components found in the uploaded JSON." };
      
    } catch (e) {
      return { error: "Invalid JSON format. Please check your file and try again." };
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
