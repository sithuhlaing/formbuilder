
import type { Template, Page, FormComponentData } from '../types';

const VALID_COMPONENT_TYPES = [
  'text_input', 'number_input', 'textarea', 'select', 'multi_select',
  'checkbox', 'radio_group', 'date_picker', 'file_upload',
  'section_divider', 'signature', 'horizontal_layout', 'vertical_layout',
  'email', 'password', 'rich_text'
];

function isValidComponent(component: any): component is FormComponentData {
  return component && component.id && component.type && VALID_COMPONENT_TYPES.includes(component.type);
}

function migratePage(page: any): Page {
  const newPage: Page = {
    id: page.id || `page-${Date.now()}-${Math.random()}`,
    title: page.title || 'Untitled Page',
    components: []
  };

  if (Array.isArray(page.components)) {
    newPage.components = page.components.filter(isValidComponent);
  }

  return newPage;
}

export function migrateTemplate(template: any): Template {
  const newTemplate: Template = {
    id: template.id || `template-${Date.now()}-${Math.random()}`,
    name: template.name || 'Untitled Form',
    pages: [],
    currentView: template.currentView || 'desktop',
  };

  if (Array.isArray(template.pages) && template.pages.length > 0) {
    newTemplate.pages = template.pages.map(migratePage);
  } else if (Array.isArray(template.fields)) {
    // Handle legacy structure with `fields` array
    newTemplate.pages = [{
      id: 'page-1',
      title: 'Page 1',
      components: template.fields.filter(isValidComponent)
    }];
  }

  if (newTemplate.pages.length === 0) {
    // Ensure every template has at least one page
    newTemplate.pages.push({
      id: 'page-1',
      title: 'Page 1',
      components: []
    });
  }

  // Remove the legacy fields property after migration
  delete newTemplate.fields;

  return newTemplate;
}

export function loadAndMigrateTemplates(): Template[] {
  try {
    const storedData = localStorage.getItem('formTemplates');
    if (!storedData) {
      return [];
    }
    const templates = JSON.parse(storedData);
    if (Array.isArray(templates)) {
      return templates.map(migrateTemplate);
    }
    return [];
  } catch (error) {
    console.error("Failed to load or migrate templates:", error);
    return [];
  }
}
