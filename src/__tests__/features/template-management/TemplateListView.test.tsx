import { render, screen, fireEvent } from '../../test-utils';
import { vi } from 'vitest';
import { TemplateListView } from '../../../features/template-management/components/TemplateListView';
import { templateService } from '../../../features/template-management/services/templateService';

// Mock the template service
vi.mock('../../../features/template-management/services/templateService');

describe('TemplateListView', () => {
  const mockTemplates = [
    {
      templateId: '1',
      name: 'Contact Form',
      pages: [{
        id: 'page1',
        title: 'Page 1',
        components: [
          { id: '1', type: 'text_input', label: 'Name' },
          { id: '2', type: 'email_input', label: 'Email' }
        ]
      }]
    },
    {
      templateId: '2',
      name: 'Survey',
      pages: [{
        id: 'page1',
        title: 'Page 1',
        components: [
          { id: '1', type: 'radio_group', label: 'Satisfaction' },
          { id: '2', type: 'textarea', label: 'Comments' }
        ]
      }]
    }
  ];

  const mockOnCreateNew = vi.fn();
  const mockOnEditTemplate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (templateService.getAllTemplates as any).mockReturnValue(mockTemplates);
  });

  it('renders list of templates', async () => {
    render(
      <TemplateListView 
        onCreateNew={mockOnCreateNew}
        onEditTemplate={mockOnEditTemplate}
      />
    );

    // Check if templates are rendered
    expect(await screen.findByText('Contact Form')).toBeInTheDocument();
    expect(screen.getByText('Survey')).toBeInTheDocument();
    
    // Check component counts (text might be split across elements)
    expect(screen.getAllByText('2')).toHaveLength(2); // Both templates have 2 components
    expect(screen.getAllByText('Components')).toHaveLength(2);
  });

  it('calls onEditTemplate when edit button is clicked', async () => {
    render(
      <TemplateListView 
        onCreateNew={mockOnCreateNew}
        onEditTemplate={mockOnEditTemplate}
      />
    );

    // Wait for templates to load
    await screen.findByText('Contact Form');
    
    // Click edit button (look for button with edit title)
    const editButtons = screen.getAllByTitle('Edit template');
    fireEvent.click(editButtons[0]);
    
    // Verify callback was called with correct template
    expect(mockOnEditTemplate).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('calls onCreateNew when create button is clicked', async () => {
    render(
      <TemplateListView 
        onCreateNew={mockOnCreateNew}
        onEditTemplate={mockOnEditTemplate}
      />
    );

    // Click create button
    const createButton = screen.getByRole('button', { name: /create new form/i });
    fireEvent.click(createButton);
    
    // Verify callback was called
    expect(mockOnCreateNew).toHaveBeenCalled();
  });
});
