import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from '../../App';

// Mock the template service
vi.mock('../../features/template-management/services/templateService', () => ({
  templateService: {
    getAllTemplates: vi.fn(() => []),
    saveTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
    getTemplate: vi.fn(),
  }
}));

// Mock lazy components to prevent loading issues
vi.mock('../../components/LazyComponents', () => ({
  LazyTemplateListView: ({ onCreateNew, onEditTemplate }: any) => (
    <div>
      <button onClick={onCreateNew}>+ Create New Form</button>
    </div>
  )
}));

// Mock SimpleFormBuilder with interactive behavior
let components: any[] = [];

vi.mock('../../components/SimpleFormBuilder', () => ({
  SimpleFormBuilder: () => {
    const addComponent = () => {
      components.push({ id: 'comp-0', type: 'text_input', label: 'Text Input' });
    };

    return (
      <div>
        <div data-testid="sidebar">
          <button onClick={addComponent}>Text Input</button>
        </div>
        <div data-testid="canvas">
          {components.map((comp, index) => (
            <div key={comp.id} data-testid={`canvas-item-${index}`} onClick={() => {}}>
              {comp.label}
            </div>
          ))}
        </div>
        <div data-testid="properties-panel">
          Properties Panel
        </div>
      </div>
    );
  }
}));

describe('App Integration Test', () => {
  beforeEach(() => {
    components = []; // Reset components before each test
  });

  it('should render App with template list and navigate to form builder', async () => {
    // 1. Render the App
    render(
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    );

    // 2. Verify template list view loads
    const createNewFormButton = await screen.findByText('+ Create New Form');
    expect(createNewFormButton).toBeInTheDocument();

    // 3. Navigate to form builder
    await userEvent.click(createNewFormButton);

    // 4. Verify form builder interface loads with key components
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();

    // 5. Verify component palette is available
    expect(screen.getByRole('button', { name: 'Text Input' })).toBeInTheDocument();

    // 6. Verify app header is present with back button
    expect(screen.getByText('← Back to Templates')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter form title...')).toBeInTheDocument();
  });
});
