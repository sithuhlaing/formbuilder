import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { FormPageCard } from '../../../features/form-builder/components/FormPageCard';
import { TEST_IDS } from '../../utils/test-utils';

describe('FormPageCard', () => {
  const mockOnClick = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnDuplicate = jest.fn();
  
  const defaultProps = {
    id: 'page-1',
    title: 'Test Page',
    isSelected: false,
    isFirst: false,
    isLast: false,
    onClick: mockOnClick,
    onDelete: mockOnDelete,
    onDuplicate: mockOnDuplicate,
    onMoveUp: jest.fn(),
    onMoveDown: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with title and action buttons', () => {
    render(<FormPageCard {...defaultProps} />);
    
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /duplicate/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<FormPageCard {...defaultProps} />);
    
    const card = screen.getByTestId(TEST_IDS.FORM_PAGE_CARD);
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<FormPageCard {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('page-1');
  });

  it('calls onDuplicate when duplicate button is clicked', () => {
    render(<FormPageCard {...defaultProps} />);
    
    const duplicateButton = screen.getByRole('button', { name: /duplicate/i });
    fireEvent.click(duplicateButton);
    
    expect(mockOnDuplicate).toHaveBeenCalledTimes(1);
    expect(mockOnDuplicate).toHaveBeenCalledWith('page-1');
  });

  it('disables move up button when isFirst is true', () => {
    render(<FormPageCard {...defaultProps} isFirst={true} />);
    
    const moveUpButton = screen.getByRole('button', { name: /move up/i });
    expect(moveUpButton).toBeDisabled();
  });

  it('disables move down button when isLast is true', () => {
    render(<FormPageCard {...defaultProps} isLast={true} />);
    
    const moveDownButton = screen.getByRole('button', { name: /move down/i });
    expect(moveDownButton).toBeDisabled();
  });
});
