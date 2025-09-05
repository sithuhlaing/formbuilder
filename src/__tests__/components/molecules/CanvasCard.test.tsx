import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { CanvasCard } from '../../../features/form-builder/components/CanvasCard';
import { TEST_IDS } from '../../utils/test-utils';

describe('CanvasCard', () => {
  const mockOnClick = jest.fn();
  const mockOnDelete = jest.fn();
  
  const defaultProps = {
    id: 'test-card',
    title: 'Test Card',
    isSelected: false,
    onClick: mockOnClick,
    onDelete: mockOnDelete,
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with title and content', () => {
    render(<CanvasCard {...defaultProps} />);
    
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<CanvasCard {...defaultProps} />);
    
    const card = screen.getByTestId(TEST_IDS.CANVAS_CARD);
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<CanvasCard {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('test-card');
  });

  it('applies selected styles when isSelected is true', () => {
    render(<CanvasCard {...defaultProps} isSelected={true} />);
    
    const card = screen.getByTestId(TEST_IDS.CANVAS_CARD);
    expect(card).toHaveClass('selected');
  });
});
