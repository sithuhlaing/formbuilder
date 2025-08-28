import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableComponent } from '../DraggableComponent';
import type { ComponentItem } from '../data/componentGroups';

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

describe('DraggableComponent', () => {
  const mockComponent: ComponentItem = {
    type: 'text_input',
    name: 'Text Input',
    icon: '📝',
    description: 'Single line text input'
  };

  const mockOnAddComponent = vi.fn();

  beforeEach(() => {
    mockOnAddComponent.mockClear();
  });

  it('renders component information correctly', () => {
    render(
      <TestWrapper>
        <DraggableComponent 
          component={mockComponent} 
          onAddComponent={mockOnAddComponent} 
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.getByText('Text Input')).toBeInTheDocument();
    expect(screen.getByText('Single line text input')).toBeInTheDocument();
  });

  it('calls onAddComponent when clicked in mobile mode', () => {
    render(
      <TestWrapper>
        <DraggableComponent 
          component={mockComponent} 
          onAddComponent={mockOnAddComponent}
          isMobile={true}
        />
      </TestWrapper>
    );
    
    const componentElement = screen.getByText('Text Input').closest('div');
    fireEvent.click(componentElement!);
    
    expect(mockOnAddComponent).toHaveBeenCalledWith('text_input');
  });

  it('shows mobile-specific text when in mobile mode', () => {
    render(
      <TestWrapper>
        <DraggableComponent 
          component={mockComponent} 
          onAddComponent={mockOnAddComponent}
          isMobile={true}
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Tap to add')).toBeInTheDocument();
  });

  it('does not show mobile text in desktop mode', () => {
    render(
      <TestWrapper>
        <DraggableComponent 
          component={mockComponent} 
          onAddComponent={mockOnAddComponent}
          isMobile={false}
        />
      </TestWrapper>
    );
    
    expect(screen.queryByText('Tap to add')).not.toBeInTheDocument();
  });

  it('does not call onAddComponent when clicked in desktop mode', () => {
    render(
      <TestWrapper>
        <DraggableComponent 
          component={mockComponent} 
          onAddComponent={mockOnAddComponent}
          isMobile={false}
        />
      </TestWrapper>
    );
    
    const componentElement = screen.getByText('Text Input').closest('div');
    fireEvent.click(componentElement!);
    
    expect(mockOnAddComponent).not.toHaveBeenCalled();
  });
});