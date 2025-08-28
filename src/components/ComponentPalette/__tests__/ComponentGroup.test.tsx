import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ComponentGroup } from '../ComponentGroup';
import type { ComponentGroup as ComponentGroupData } from '../data/componentGroups';

// Mock react-dnd for testing
vi.mock('react-dnd', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()]
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

describe('ComponentGroup', () => {
  const mockGroup: ComponentGroupData = {
    title: 'Test Group',
    components: [
      { type: 'text_input', name: 'Text Input', icon: '📝', description: 'Single line text input' },
      { type: 'email_input', name: 'Email', icon: '📧', description: 'Email address input' }
    ]
  };

  const mockOnAddComponent = vi.fn();

  beforeEach(() => {
    mockOnAddComponent.mockClear();
  });

  it('renders group title correctly', () => {
    render(
      <TestWrapper>
        <ComponentGroup 
          group={mockGroup} 
          onAddComponent={mockOnAddComponent} 
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Group')).toBeInTheDocument();
  });

  it('renders all components when expanded by default', () => {
    render(
      <TestWrapper>
        <ComponentGroup 
          group={mockGroup} 
          onAddComponent={mockOnAddComponent} 
          defaultExpanded={true}
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Text Input')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('does not render components when collapsed by default', () => {
    render(
      <TestWrapper>
        <ComponentGroup 
          group={mockGroup} 
          onAddComponent={mockOnAddComponent} 
          defaultExpanded={false}
        />
      </TestWrapper>
    );
    
    expect(screen.queryByText('Text Input')).not.toBeInTheDocument();
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });

  it('toggles expansion when header is clicked', () => {
    render(
      <TestWrapper>
        <ComponentGroup 
          group={mockGroup} 
          onAddComponent={mockOnAddComponent} 
          defaultExpanded={true}
        />
      </TestWrapper>
    );
    
    const header = screen.getByText('Test Group');
    
    // Initially expanded - components should be visible
    expect(screen.getByText('Text Input')).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(header);
    expect(screen.queryByText('Text Input')).not.toBeInTheDocument();
    
    // Click to expand again
    fireEvent.click(header);
    expect(screen.getByText('Text Input')).toBeInTheDocument();
  });

  it('passes mobile prop to child components', () => {
    render(
      <TestWrapper>
        <ComponentGroup 
          group={mockGroup} 
          onAddComponent={mockOnAddComponent} 
          isMobile={true}
        />
      </TestWrapper>
    );
    
    // Mobile-specific text should be present
    expect(screen.getAllByText('Tap to add')).toHaveLength(2);
  });

  it('forwards onAddComponent calls from child components', () => {
    render(
      <TestWrapper>
        <ComponentGroup 
          group={mockGroup} 
          onAddComponent={mockOnAddComponent} 
          isMobile={true}
        />
      </TestWrapper>
    );
    
    const textInputComponent = screen.getByText('Text Input').closest('div');
    fireEvent.click(textInputComponent!);
    
    expect(mockOnAddComponent).toHaveBeenCalledWith('text_input');
  });
});