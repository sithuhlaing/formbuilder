import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { CanvasCard } from '../../../features/form-builder/components/CanvasCard';

describe('CanvasCard', () => {
  const mockOnDrop = vi.fn();
  const mockOnSelect = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnMove = vi.fn();

  const defaultProps = {
    components: [],
    onDrop: mockOnDrop,
    onSelect: mockOnSelect,
    onDelete: mockOnDelete,
    onMove: mockOnMove,
    selectedId: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty canvas when no components', () => {
    render(<CanvasCard {...defaultProps} />);

    expect(screen.getByText(/drag components here/i)).toBeInTheDocument();
  });

  it('renders components when provided', () => {
    const components = [
      {
        id: 'test-1',
        type: 'text_input',
        label: 'Test Input',
        fieldId: 'test_1',
        required: false,
        placeholder: 'Enter text'
      }
    ];

    render(<CanvasCard {...defaultProps} components={components} />);

    expect(screen.getByText('Test Input')).toBeInTheDocument();
  });

  it('handles component selection', () => {
    const components = [
      {
        id: 'test-1',
        type: 'text_input',
        label: 'Test Input',
        fieldId: 'test_1',
        required: false,
        placeholder: 'Enter text'
      }
    ];

    render(<CanvasCard {...defaultProps} components={components} selectedId="test-1" />);

    // Component should be rendered and potentially highlighted as selected
    expect(screen.getByText('Test Input')).toBeInTheDocument();
  });
});