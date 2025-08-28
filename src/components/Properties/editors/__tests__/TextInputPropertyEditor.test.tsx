import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TextInputPropertyEditor } from '../TextInputPropertyEditor';
import type { FormComponentData } from '../../../../types';

describe('TextInputPropertyEditor', () => {
  const mockComponent: FormComponentData = {
    id: 'test-id',
    type: 'text_input',
    label: 'Test Label',
    fieldId: 'test-field',
    required: false,
    placeholder: 'Test placeholder'
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders all form fields correctly', () => {
    render(<TextInputPropertyEditor component={mockComponent} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByDisplayValue('Test Label')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-field')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test placeholder')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onUpdate when label changes', () => {
    render(<TextInputPropertyEditor component={mockComponent} onUpdate={mockOnUpdate} />);
    
    const labelInput = screen.getByDisplayValue('Test Label');
    fireEvent.change(labelInput, { target: { value: 'New Label' } });
    
    expect(mockOnUpdate).toHaveBeenCalledWith({ label: 'New Label' });
  });

  it('calls onUpdate when fieldId changes', () => {
    render(<TextInputPropertyEditor component={mockComponent} onUpdate={mockOnUpdate} />);
    
    const fieldIdInput = screen.getByDisplayValue('test-field');
    fireEvent.change(fieldIdInput, { target: { value: 'new-field-id' } });
    
    expect(mockOnUpdate).toHaveBeenCalledWith({ fieldId: 'new-field-id' });
  });

  it('calls onUpdate when required checkbox changes', () => {
    render(<TextInputPropertyEditor component={mockComponent} onUpdate={mockOnUpdate} />);
    
    const requiredCheckbox = screen.getByRole('checkbox');
    fireEvent.click(requiredCheckbox);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({ required: true });
  });

  it('calls onUpdate when placeholder changes', () => {
    render(<TextInputPropertyEditor component={mockComponent} onUpdate={mockOnUpdate} />);
    
    const placeholderInput = screen.getByDisplayValue('Test placeholder');
    fireEvent.change(placeholderInput, { target: { value: 'New placeholder' } });
    
    expect(mockOnUpdate).toHaveBeenCalledWith({ placeholder: 'New placeholder' });
  });

  it('handles empty values correctly', () => {
    const emptyComponent: FormComponentData = {
      id: 'test-id',
      type: 'text_input'
    };
    
    render(<TextInputPropertyEditor component={emptyComponent} onUpdate={mockOnUpdate} />);
    
    // Should render empty inputs without crashing
    expect(screen.getAllByDisplayValue('')).toHaveLength(3); // label, fieldId, placeholder
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
});