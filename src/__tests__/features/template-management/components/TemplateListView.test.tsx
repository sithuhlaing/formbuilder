import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TemplateListView } from '../TemplateListView';
import { templateService } from '../../services/templateService';


// Mock the templateService
vi.mock('../../../../../features/template-management/services/templateService', () => ({
  templateService: {
    getAllTemplates: vi.fn(() => [...mockTemplates]),
    updateTemplate: vi.fn((id, updates) => {
      const template = mockTemplates.find(t => t.templateId === id);
      if (!template) return null;
      
      const updated = { ...template, ...updates, modifiedDate: new Date().toISOString() };
      const index = mockTemplates.findIndex(t => t.templateId === id);
      if (index !== -1) {
        mockTemplates[index] = updated;
      }
      return updated;
    }),
    deleteTemplate: vi.fn((id) => {
      const index = mockTemplates.findIndex(t => t.templateId === id);
      if (index !== -1) {
        mockTemplates.splice(index, 1);
        return true;
      }
      return false;
    })
  }
}));

// Mock the modal components
vi.mock('../../../../../features/form-builder/components/PreviewModal', () => ({
  default: ({ isOpen, onClose, templateName }: any) => 
    isOpen ? (
      <div data-testid="preview-modal">
        <h2>Preview: {templateName}</h2>
        <button onClick={onClose}>Close Preview</button>
      </div>
    ) : null
}));

// Mock shared components
vi.mock('../../../../../shared/components', () => ({
  ActionButton: ({ onClick, icon, title, variant }: any) => (
    <button 
      onClick={onClick} 
      title={title} 
      data-variant={variant}
      data-testid={`action-button-${title?.toLowerCase().replace(/\s+/g, '-')}`}
    >
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
let mockTemplates = [
  {
    templateId: 'template-1',
    name: 'Test Template 1',
    type: 'form',
    fields: [],
    pages: [{
      id: 'page1',
      title: 'Page 1',
      components: [
        { id: 'comp1', type: 'text_input', label: 'Text Input' },
        { id: 'comp2', type: 'select', label: 'Dropdown' }
      ],
      layout: { type: 'vertical', direction: 'column' },
      order: 0
    }],
    createdDate: '2023-01-01T00:00:00Z',
    modifiedDate: '2023-01-01T00:00:00Z',
    jsonSchema: {}
  },
  {
    templateId: 'template-2',
    name: 'Test Template 2',
    type: 'survey',
    fields: [],
    pages: [{
      id: 'page1',
      title: 'Page 1',
      components: [
        { id: 'comp3', type: 'checkbox', label: 'Checkbox' },
        { id: 'comp4', type: 'radio_group', label: 'Radio Group' }
      ],
      layout: { type: 'vertical', direction: 'column' },
      order: 0
    }],
    createdDate: '2023-01-02T00:00:00Z',
    modifiedDate: '2023-01-02T00:00:00Z',
    jsonSchema: {}
  }
];

describe('TemplateListView', () => {
  const mockOnCreateNew = vi.fn();
  const mockOnEditTemplate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (templateService.getAllTemplates as any).mockReturnValue([...mockTemplates]);
  });

  it('renders template list with correct items', () => {
    render(
      <TemplateListView 
        onCreateNew={mockOnCreateNew}
        onEditTemplate={mockOnEditTemplate}
      />
    );

    // Check if templates are rendered
    expect(screen.getByText('Test Template 1')).toBeInTheDocument();
    expect(screen.getByText('Test Template 2')).toBeInTheDocument();
    
    // Check component counts
    expect(screen.getByText('2 components')).toBeInTheDocument();
  });

  it('calls onEditTemplate when edit button is clicked', () => {
    render(
      <TemplateListView 
        onCreateNew={mockOnCreateNew}
        onEditTemplate={mockOnEditTemplate}
      />
    );

    const editButton = screen.getByTestId('action-button-edit-template');
    fireEvent.click(editButton);
    
    expect(mockOnEditTemplate).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('deletes template when delete is confirmed', async () => {
    render(
      <TemplateListView 
        onCreateNew={mockOnCreateNew}
        onEditTemplate={mockOnEditTemplate}
      />
    );

    const deleteButton = screen.getByTestId('action-button-delete-template');
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);
    
    expect(templateService.deleteTemplate).toHaveBeenCalledWith('template-1');
  });
});
