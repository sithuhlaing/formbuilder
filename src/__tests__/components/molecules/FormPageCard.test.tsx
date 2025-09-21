import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { FormPageCard } from '../../../features/form-builder/components/FormPageCard';

describe('FormPageCard', () => {
  const mockOnFormTitleChange = vi.fn();
  const mockOnPreviousPage = vi.fn();
  const mockOnNextPage = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnAddPage = vi.fn();
  const mockOnUpdatePageTitle = vi.fn();

  const defaultProps = {
    formTitle: 'Test Form',
    onFormTitleChange: mockOnFormTitleChange,
    currentPageIndex: 0,
    totalPages: 2,
    currentPageTitle: 'Page 1',
    onPreviousPage: mockOnPreviousPage,
    onNextPage: mockOnNextPage,
    onSubmit: mockOnSubmit,
    onAddPage: mockOnAddPage,
    canGoBack: false,
    canGoNext: true,
    isLastPage: false,
    onUpdatePageTitle: mockOnUpdatePageTitle,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form title input', () => {
    render(<FormPageCard {...defaultProps} />);

    const titleInput = screen.getByDisplayValue('Test Form');
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByText('Form Title')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<FormPageCard {...defaultProps} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add page/i })).toBeInTheDocument();
  });

  it('calls onFormTitleChange when title is changed', () => {
    render(<FormPageCard {...defaultProps} />);

    const titleInput = screen.getByDisplayValue('Test Form');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    expect(mockOnFormTitleChange).toHaveBeenCalledWith('New Title');
  });

  it('disables previous button when canGoBack is false', () => {
    render(<FormPageCard {...defaultProps} canGoBack={false} />);

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();
  });

  it('disables next button when canGoNext is false', () => {
    render(<FormPageCard {...defaultProps} canGoNext={false} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('calls onAddPage when add page button is clicked', () => {
    render(<FormPageCard {...defaultProps} />);

    const addPageButton = screen.getByRole('button', { name: /add page/i });
    fireEvent.click(addPageButton);

    expect(mockOnAddPage).toHaveBeenCalled();
  });
});