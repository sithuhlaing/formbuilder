import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TemplateListView } from '../features/template-management/components/TemplateListView';
import { templateService } from '../features/template-management/services/templateService';
import type { FormTemplate } from '../types';

// Mock the templateService
vi.mock('../features/template-management/services/templateService', () => ({
  templateService: {
    getAllTemplates: vi.fn(),
  }
}));

// Mock the modal components
vi.mock('../features/form-builder/components/PreviewModal', () => ({
  default: ({ isOpen, onClose, templateName }: any) => 
    isOpen ? (
      <div>
        <h2>Preview: {templateName}</h2>
        <button onClick={onClose}>Close Preview</button>
      </div>
    ) : null
}));

vi.mock('../shared/components', () => ({
  ActionButton: ({ onClick, icon, title, variant }: any) => (
    <button onClick={onClick} title={title} data-variant={variant}>
      {icon}
    </button>
  ),
  Button: ({ onClick, children, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Modal: ({ isOpen, onClose, title, children }: any) => (
    isOpen ? (
      <div data-testid="modal">
        <div>{title}</div>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  )
}));

// Sample test templates
const mockTemplates: FormTemplate[] = [
  {
    templateId: 'template-1',
    name: 'Customer Feedback Form',
    type: 'assessment',
    fields: [
      {
        id: 'field-1',
        type: 'text_input',
        label: 'Name',
        placeholder: 'Enter your name',
        required: true,
        fieldId: 'name'
      },
      {
        id: 'field-2', 
        type: 'textarea',
        label: 'Comments',
        placeholder: 'Your feedback',
        required: false,
        fieldId: 'comments'
      },
      {
        id: 'field-3',
        type: 'select',
        label: 'Rating',
        options: ['Excellent', 'Good', 'Average', 'Poor'],
        required: true,
        fieldId: 'rating'
      }
    ],
    pages: [
      {
        id: 'page-1',
        title: 'Feedback',
        components: [
          {
            id: 'field-1',
            type: 'text_input',
            label: 'Name',
            placeholder: 'Enter your name',
            required: true,
            fieldId: 'name'
          }
        ],
        layout: {}
      }
    ],
    createdDate: '2024-01-01T10:00:00Z',
    modifiedDate: '2024-01-02T11:00:00Z',
    jsonSchema: null
  },
  {
    templateId: 'template-2',
    name: 'Employee Survey',
    type: 'assessment',
    fields: [
      {
        id: 'field-4',
        type: 'radio_group',
        label: 'Job Satisfaction',
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
        required: true,
        fieldId: 'satisfaction'
      }
    ],
    pages: [],
    createdDate: '2024-01-03T09:00:00Z',
    modifiedDate: '2024-01-03T09:30:00Z',
    jsonSchema: null
  }
];

describe('TemplateListView - Welcome Screen Tests', () => {
  const mockOnCreateNew = vi.fn();
  const mockOnEditTemplate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State - Welcome Screen', () => {
    beforeEach(() => {
      (templateService.getAllTemplates as any).mockReturnValue([]);
    });

    test('should show welcome screen when no templates exist', () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      // Check welcome screen elements
      expect(screen.getByText('No templates yet')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first form template')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create your first form/i })).toBeInTheDocument();
    });

    test('should call onCreateNew when "Create Your First Form" button is clicked', () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      const createButton = screen.getByRole('button', { name: /create your first form/i });
      fireEvent.click(createButton);

      expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
    });

    test('should show "Create New Form" button in header even when empty', () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      expect(screen.getByRole('button', { name: /create new form/i })).toBeInTheDocument();
    });
  });

  describe('Templates List View', () => {
    beforeEach(() => {
      (templateService.getAllTemplates as any).mockReturnValue(mockTemplates);
    });

    test('should display list of templates', () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      // Check if templates are rendered
      expect(screen.getByText('Customer Feedback Form')).toBeInTheDocument();
      expect(screen.getByText('Employee Survey')).toBeInTheDocument();
      expect(screen.getByText('Form Templates')).toBeInTheDocument(); // Header title
    });

    test('should show template information correctly', () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      // Check template details - using more specific queries
      expect(screen.getByText('3')).toBeInTheDocument(); // Customer Feedback Form has 3 fields
      expect(screen.getAllByText('1')).toHaveLength(3); // Multiple "1" values exist (Employee Survey 1 field, both templates 1 page each)
      expect(screen.getAllByText('assessment')).toHaveLength(2); // Both templates are assessment type
    });

    test('should show field preview for templates', () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      // Check field previews (first 3 fields shown)
      expect(screen.getByText('text input')).toBeInTheDocument(); // "text_input" becomes "text input"
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('textarea')).toBeInTheDocument();
      expect(screen.getByText('Comments')).toBeInTheDocument();
    });
  });

  describe('Template Actions', () => {
    beforeEach(() => {
      (templateService.getAllTemplates as any).mockReturnValue(mockTemplates);
    });

    test('should call onEditTemplate when edit button is clicked', () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      // Find and click the first edit button (✏️)
      const editButtons = screen.getAllByTitle('Edit template');
      fireEvent.click(editButtons[0]);

      expect(mockOnEditTemplate).toHaveBeenCalledTimes(1);
      expect(mockOnEditTemplate).toHaveBeenCalledWith(mockTemplates[0]);
    });

    test('should open preview modal when preview button is clicked', async () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      // Find and click the first preview button (👁️)
      const previewButtons = screen.getAllByTitle('Preview template');
      fireEvent.click(previewButtons[0]);

      // Check if preview modal opens
      await waitFor(() => {
        expect(screen.getByText('Preview: Customer Feedback Form')).toBeInTheDocument();
      });
    });

    test('should close preview modal when close button is clicked', async () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      // Open preview modal
      const previewButtons = screen.getAllByTitle('Preview template');
      fireEvent.click(previewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Preview: Customer Feedback Form')).toBeInTheDocument();
      });

      // Close preview modal
      const closeButton = screen.getByText('Close Preview');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Preview: Customer Feedback Form')).toBeNull();
      });
    });

    test('should show delete confirmation when delete button is clicked', async () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      // Find and click the first delete button (🗑️)
      const deleteButtons = screen.getAllByTitle('Delete template');
      fireEvent.click(deleteButtons[0]);

      // Check if confirmation dialog opens
      await waitFor(() => {
        expect(screen.getByText('Delete Template')).toBeInTheDocument();
        expect(screen.getByText(/are you sure you want to delete.*customer feedback form/i)).toBeInTheDocument();
      });
    });

    test('should delete template when confirmed', async () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn(() => JSON.stringify(mockTemplates)),
        setItem: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });

      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      // Open delete confirmation
      const deleteButtons = screen.getAllByTitle('Delete template');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Template')).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: 'Delete Template' });
      fireEvent.click(confirmButton);

      // Check if localStorage.setItem was called (template deleted)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'formTemplates',
        expect.any(String)
      );
    });
  });

  describe('Create New Template', () => {
    beforeEach(() => {
      (templateService.getAllTemplates as any).mockReturnValue(mockTemplates);
    });

    test('should call onCreateNew when "Create New Form" button is clicked', () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      const createButton = screen.getByRole('button', { name: /create new form/i });
      fireEvent.click(createButton);

      expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
    });
  });

  describe('Template Loading', () => {
    test('should load templates from templateService on mount', () => {
      (templateService.getAllTemplates as any).mockReturnValue(mockTemplates);
      
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      expect(templateService.getAllTemplates).toHaveBeenCalledTimes(1);
    });

    test('should handle empty template list gracefully', () => {
      (templateService.getAllTemplates as any).mockReturnValue([]);
      
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      expect(screen.getByText('No templates yet')).toBeInTheDocument();
    });

    test('should handle templates without fields gracefully', () => {
      const templatesWithoutFields = [{
        ...mockTemplates[0],
        fields: []
      }];
      (templateService.getAllTemplates as any).mockReturnValue(templatesWithoutFields);
      
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument(); // Check for field count of 0
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (templateService.getAllTemplates as any).mockReturnValue(mockTemplates);
    });

    test('should have proper button labels and titles', () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      expect(screen.getAllByTitle('Edit template')).toHaveLength(2);
      expect(screen.getAllByTitle('Preview template')).toHaveLength(2);  
      expect(screen.getAllByTitle('Delete template')).toHaveLength(2);
    });

    test('should have proper heading structure', () => {
      render(
        <TemplateListView 
          onCreateNew={mockOnCreateNew}
          onEditTemplate={mockOnEditTemplate}
        />
      );

      expect(screen.getByRole('heading', { name: /form templates/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /customer feedback form/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /employee survey/i })).toBeInTheDocument();
    });
  });
});