import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { templateService } from '../../../features/template-management/services/templateService';

// Define minimal interfaces needed for testing
interface FormPage {
  id: string;
  title: string;
  components: any[];
  layout?: any;
  order?: number;
}

interface FormTemplate {
  templateId: string;
  name: string;
  type: string;
  fields: any[];
  pages: FormPage[];
  createdDate: string;
  modifiedDate: string;
  jsonSchema: any;
}

// Mock console methods
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

describe('TemplateService', () => {
  const mockTemplate: FormTemplate = {
    templateId: 'template-1',
    name: 'Test Template',
    type: 'other',
    fields: [],
    pages: [{
      id: 'page-1',
      title: 'Page 1',
      components: [],
      layout: { type: 'vertical' },
      order: 0
    }],
    createdDate: '2023-01-01T00:00:00Z',
    modifiedDate: '2023-01-01T00:00:00Z',
    jsonSchema: {}
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllTemplates', () => {
    it('should return empty array when no templates exist', () => {
      const templates = templateService.getAllTemplates();
      expect(templates).toEqual([]);
    });

    it('should return stored templates', () => {
      localStorage.setItem('formTemplates', JSON.stringify([mockTemplate]));
      const templates = templateService.getAllTemplates();
      expect(templates).toEqual([mockTemplate]);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('formTemplates', '{invalid json}');
      const templates = templateService.getAllTemplates();
      expect(templates).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid templates data in localStorage, resetting to empty array'
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith('formTemplates');
    });
  });

  describe('saveTemplate', () => {
    it('should save a new template with generated ID', () => {
      const newTemplate = {
        name: 'New Template',
        pages: [{
          id: 'page-1',
          title: 'Page 1',
          components: [],
          layout: { type: 'vertical' },
          order: 0
        }]
      };

      const savedTemplate = templateService.saveTemplate(newTemplate);

      expect(savedTemplate).toMatchObject({
        name: 'New Template',
        templateId: expect.stringMatching(/^template_\d+$/),
        type: 'other',
        fields: [],
        jsonSchema: {}
      });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'formTemplates',
        expect.any(String)
      );
    });
  });

  describe('updateTemplate', () => {
    it('should update an existing template', () => {
      localStorage.setItem('formTemplates', JSON.stringify([mockTemplate]));
      
      const updatedName = 'Updated Template Name';
      const updatedTemplate = templateService.updateTemplate('template-1', { name: updatedName });

      expect(updatedTemplate).toMatchObject({
        templateId: 'template-1',
        name: updatedName,
        modifiedDate: expect.any(String)
      });
      expect(updatedTemplate?.modifiedDate).not.toBe('2023-01-01T00:00:00Z');
    });

    it('should return null for non-existent template', () => {
      const result = templateService.updateTemplate('non-existent-id', { name: 'New Name' });
      expect(result).toBeNull();
    });
  });

  describe('deleteTemplate', () => {
    it('should delete an existing template', () => {
      localStorage.setItem('formTemplates', JSON.stringify([mockTemplate]));
      
      const result = templateService.deleteTemplate('template-1');
      
      expect(result).toBe(true);
      expect(JSON.parse(localStorage.setItem.mock.calls[0][1])).toHaveLength(0);
    });

    it('should return false when template does not exist', () => {
      const result = templateService.deleteTemplate('non-existent-id');
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getTemplate', () => {
    it('should return template by ID', () => {
      localStorage.setItem('formTemplates', JSON.stringify([mockTemplate]));
      
      const result = templateService.getTemplate('template-1');
      
      expect(result).toEqual(mockTemplate);
    });

    it('should return null for non-existent template', () => {
      const result = templateService.getTemplate('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const templates = templateService.getAllTemplates();
      
      expect(templates).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load templates:',
        expect.any(Error)
      );
    });
  });
});

      components: []
    }],
    jsonSchema: {}
  };

  const mockTemplates: FormTemplate[] = [
    {
      ...mockTemplate,
      templateId: 'template-1',
      name: 'Template 1',
      createdDate: '2023-01-01T00:00:00Z',
      modifiedDate: '2023-01-01T00:00:00Z'
    },
    {
      ...mockTemplate,
      templateId: 'template-2',
      name: 'Template 2',
      createdDate: '2023-01-02T00:00:00Z',
      modifiedDate: '2023-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    // Clear all mocks and reset localStorage before each test
    vi.clearAllMocks();
    localStorage.clear();
    // Reset the module to clear any internal state
    vi.resetModules();
  });

  describe('getAllTemplates', () => {
    it('should return empty array when no templates exist', () => {
      const templates = templateService.getAllTemplates();
      expect(templates).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith('formTemplates');
    });

    it('should return saved templates', () => {
      localStorage.setItem('formTemplates', JSON.stringify(mockTemplates));
      const templates = templateService.getAllTemplates();
      expect(templates).toEqual(mockTemplates);
    });

    it('should handle invalid JSON data', () => {
      localStorage.setItem('formTemplates', 'invalid-json');
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const templates = templateService.getAllTemplates();
      
      expect(templates).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid templates data in localStorage, resetting to empty array'
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith('formTemplates');
      consoleWarnSpy.mockRestore();
    });
  });

  describe('saveTemplate', () => {
    it('should save a new template with generated ID', () => {
      const newTemplate = {
        name: 'New Template',
        pages: [{ id: 'page-1', title: 'Page 1', components: [] }]
      };

      const savedTemplate = templateService.saveTemplate(newTemplate);

      expect(savedTemplate).toMatchObject({
        name: 'New Template',
        templateId: expect.any(String),
        createdDate: expect.any(String),
        modifiedDate: expect.any(String)
      });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'formTemplates',
        expect.any(String)
      );
    });

    it('should update an existing template', () => {
      // First, save a template
      localStorage.setItem('formTemplates', JSON.stringify(mockTemplates));
      
      const updatedTemplate = {
        ...mockTemplates[0],
        name: 'Updated Template Name'
      };

      const savedTemplate = templateService.updateTemplate(updatedTemplate);

      expect(savedTemplate).toMatchObject({
        templateId: mockTemplates[0].templateId,
        name: 'Updated Template Name',
        modifiedDate: expect.not.toBe(mockTemplates[0].modifiedDate)
      });
    });
  });

  describe('deleteTemplate', () => {
    it('should delete an existing template', () => {
      localStorage.setItem('formTemplates', JSON.stringify(mockTemplates));
      
      const result = templateService.deleteTemplate('template-1');
      
      expect(result).toBe(true);
      const remainingTemplates = JSON.parse(localStorage.setItem.mock.calls[0][1]);
      expect(remainingTemplates).toHaveLength(1);
      expect(remainingTemplates[0].templateId).toBe('template-2');
    });

    it('should return false when template does not exist', () => {
      localStorage.setItem('formTemplates', JSON.stringify(mockTemplates));
      
      const result = templateService.deleteTemplate('non-existent-id');
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getTemplateById', () => {
    it('should return template by ID', () => {
      localStorage.setItem('formTemplates', JSON.stringify(mockTemplates));
      
      const template = templateService.getTemplateById('template-1');
      
      expect(template).toEqual(mockTemplates[0]);
    });

    it('should return undefined for non-existent template', () => {
      localStorage.setItem('formTemplates', JSON.stringify(mockTemplates));
      
      const template = templateService.getTemplateById('non-existent-id');
      
      expect(template).toBeUndefined();
    });
  });

  describe('import/export', () => {
    it('should export template as JSON', () => {
      localStorage.setItem('formTemplates', JSON.stringify(mockTemplates));
      
      const json = templateService.exportJSON('template-1');
      
      expect(json).toEqual(JSON.stringify(mockTemplates[0], null, 2));
    });

    it('should import template from JSON', () => {
      const templateToImport = {
        ...mockTemplate,
        templateId: 'imported-template',
        name: 'Imported Template'
      };
      
      const importedTemplate = templateService.importJSON(JSON.stringify(templateToImport));
      
      expect(importedTemplate).toMatchObject({
        templateId: 'imported-template',
        name: 'Imported Template'
      });
      
      const savedTemplates = JSON.parse(localStorage.setItem.mock.calls[0][1]);
      expect(savedTemplates).toContainEqual(importedTemplate);
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force localStorage to throw an error
      localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      // Should not throw
      const templates = templateService.getAllTemplates();
      
      expect(templates).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load templates:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });
});
