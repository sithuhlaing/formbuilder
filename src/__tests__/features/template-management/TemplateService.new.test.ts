
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { templateService } from '../../../features/template-management/services/templateService';
import type { FormTemplate } from '../../../features/template-management/types';

// Fix the localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Test data
const createMockTemplate = (overrides: Partial<FormTemplate> = {}): FormTemplate => ({
  templateId: '1',
  name: 'Test Template',
  type: 'other',
  fields: [],
  pages: [{
    id: 'page1',
    title: 'Page 1',
    components: [
      { id: '1', type: 'text_input', label: 'Name' },
      { id: '2', type: 'email_input', label: 'Email' }
    ],
    layout: { type: 'vertical', direction: 'column' },
    order: 0
  }],
  createdDate: new Date().toISOString(),
  modifiedDate: new Date().toISOString(),
  jsonSchema: {},
  ...overrides
});

const mockTemplates: FormTemplate[] = [
  createMockTemplate({ templateId: '1', name: 'Contact Form' }),
  createMockTemplate({ 
    templateId: '2', 
    name: 'Survey',
    pages: [{
      id: 'page1',
      title: 'Page 1',
      components: [
        { id: '1', type: 'radio_group', label: 'Satisfaction' },
        { id: '2', type: 'textarea', label: 'Comments' }
      ],
      layout: { type: 'vertical', direction: 'column' },
      order: 0
    }]
  })
];

// Mock the storage key used by the template service
const TEMPLATE_STORAGE_KEY = 'formTemplates';

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
});

describe('TemplateService', () => {
  describe('getAllTemplates', () => {
    it('should return empty array when no templates exist', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      
      const templates = templateService.getAllTemplates();
      expect(templates).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(TEMPLATE_STORAGE_KEY);
    });

    it('should return all templates', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTemplates));
      
      const templates = templateService.getAllTemplates();
      expect(templates).toEqual(mockTemplates);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(TEMPLATE_STORAGE_KEY);
    });
  });

  describe('getTemplate', () => {
    it('should return template by id', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTemplates));
      
      const result = templateService.getTemplate('1');
      
      expect(result).toEqual(mockTemplates[0]);
    });

    it('should return null for non-existent template', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTemplates));
      
      const result = templateService.getTemplate('nonexistent');
      
      expect(result).toBeNull();
    });

    it('should return template by ID', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTemplates));
      
      const result = templateService.getTemplate('1');
      
      expect(result).toEqual(mockTemplates[0]);
    });

    it('should return null for non-existent template', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTemplates));
      
      const result = templateService.getTemplate('999');
      
      expect(result).toBeNull();
    });
  });

  describe('saveTemplate', () => {
    it('should create new template with generated ID and timestamps', () => {
      const templateData = {
        name: 'New Template',
        pages: [{
          id: 'page1',
          title: 'Page 1',
          components: [
            { id: '1', type: 'text_input', label: 'Name' }
          ],
          layout: { type: 'vertical', direction: 'column' },
          order: 0
        }]
      };
      
      // Mock existing templates (empty array)
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([]));
      
      const saved = templateService.saveTemplate(templateData);
      
      // Should return the saved template with generated ID and timestamps
      expect(saved).toMatchObject({
        ...templateData,
        templateId: expect.any(String),
        type: 'other',
        fields: [],
        jsonSchema: {},
        createdDate: expect.any(String),
        modifiedDate: expect.any(String)
      });
      
      // Should be saved to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        TEMPLATE_STORAGE_KEY,
        expect.any(String)
      );
      
      const savedTemplates = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedTemplates).toHaveLength(1);
      expect(savedTemplates[0].name).toBe('New Template');
    });
  });

  describe('updateTemplate', () => {
    it('should update existing template', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([mockTemplates[0]]));
      
      const updatedTemplate = {
        ...mockTemplates[0],
        name: 'Updated Name',
        pages: [
          ...mockTemplates[0].pages,
          {
            id: 'page2',
            title: 'Page 2',
            components: [],
            layout: { type: 'vertical', direction: 'column' },
            order: 1
          }
        ]
      };
      
      const result = templateService.updateTemplate(updatedTemplate.templateId, {
        name: updatedTemplate.name,
        pages: updatedTemplate.pages
      });
      
      expect(result).toMatchObject({
        templateId: '1',
        name: 'Updated Name',
        modifiedDate: expect.any(String)
      });
      
      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should return null for non-existent template', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTemplates));
      
      const result = templateService.updateTemplate('nonexistent', {
        name: 'New Name',
        pages: []
      });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template by ID', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTemplates));
      
      const result = templateService.deleteTemplate('1');
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should return false for non-existent template', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTemplates));
      
      const result = templateService.deleteTemplate('nonexistent');
      
      expect(result).toBe(false);
    });
  });
});
