import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import { ComponentPropertiesPanel } from '../../components/ComponentPropertiesPanel';
import type { Component } from '../../types/components';

describe('ComponentPropertiesPanel', () => {
  const mockOnUpdateComponent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no component selected', () => {
    render(
      <ComponentPropertiesPanel
        selectedComponent={null}
        onUpdateComponent={mockOnUpdateComponent}
      />
    );

    expect(screen.getByText('No Component Selected')).toBeInTheDocument();
    expect(screen.getByText('Click on a component in the canvas to edit its properties')).toBeInTheDocument();
  });

  it('renders component properties when component is selected', () => {
    const testComponent: Component = {
      id: 'test-1',
      type: 'text_input',
      label: 'Test Input',
      placeholder: 'Enter text...',
      required: false
    };

    render(
      <ComponentPropertiesPanel
        selectedComponent={testComponent}
        onUpdateComponent={mockOnUpdateComponent}
      />
    );

    expect(screen.getByDisplayValue('Test Input')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Enter text...')).toBeInTheDocument();
  });

  it('calls onUpdateComponent when properties are changed', () => {
    const testComponent: Component = {
      id: 'test-1',
      type: 'text_input',
      label: 'Test Input',
      required: false
    };

    render(
      <ComponentPropertiesPanel
        selectedComponent={testComponent}
        onUpdateComponent={mockOnUpdateComponent}
      />
    );

    const labelInput = screen.getByDisplayValue('Test Input');
    fireEvent.change(labelInput, { target: { value: 'Updated Label' } });

    expect(mockOnUpdateComponent).toHaveBeenCalledWith('test-1', { label: 'Updated Label' });
  });

  it('renders validation tab for input components', () => {
    const testComponent: Component = {
      id: 'test-1',
      type: 'text_input',
      label: 'Test Input',
      required: false
    };

    render(
      <ComponentPropertiesPanel
        selectedComponent={testComponent}
        onUpdateComponent={mockOnUpdateComponent}
      />
    );

    const validationTab = screen.getByText('Validation');
    expect(validationTab).toBeInTheDocument();

    fireEvent.click(validationTab);
    expect(screen.getByText('Minimum Length')).toBeInTheDocument();
    expect(screen.getByText('Maximum Length')).toBeInTheDocument();
  });

  it('renders styling tab', () => {
    const testComponent: Component = {
      id: 'test-1',
      type: 'text_input',
      label: 'Test Input',
      required: false
    };

    render(
      <ComponentPropertiesPanel
        selectedComponent={testComponent}
        onUpdateComponent={mockOnUpdateComponent}
      />
    );

    const stylingTab = screen.getByText('Styling');
    expect(stylingTab).toBeInTheDocument();

    fireEvent.click(stylingTab);
    expect(screen.getByText('Text Color')).toBeInTheDocument();
    expect(screen.getByText('Background Color')).toBeInTheDocument();
  });

  it('renders component-specific properties for select components', () => {
    const testComponent: Component = {
      id: 'test-1',
      type: 'select',
      label: 'Test Select',
      options: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' }
      ]
    };

    render(
      <ComponentPropertiesPanel
        selectedComponent={testComponent}
        onUpdateComponent={mockOnUpdateComponent}
      />
    );

    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Option 2')).toBeInTheDocument();
  });

  it('allows adding new options for select components', () => {
    const testComponent: Component = {
      id: 'test-1',
      type: 'select',
      label: 'Test Select',
      options: []
    };

    render(
      <ComponentPropertiesPanel
        selectedComponent={testComponent}
        onUpdateComponent={mockOnUpdateComponent}
      />
    );

    const addOptionButton = screen.getByText('+ Add Option');
    fireEvent.click(addOptionButton);

    expect(mockOnUpdateComponent).toHaveBeenCalledWith('test-1', {
      options: [{ label: 'New Option', value: 'option_1' }]
    });
  });
});