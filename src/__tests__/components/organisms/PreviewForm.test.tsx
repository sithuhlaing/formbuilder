import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { PreviewForm } from '../../../features/form-builder/components/PreviewForm';
import { TEST_IDS } from '../../utils/test-utils';

describe('PreviewForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();
  
  const defaultProps = {
    formTitle: 'Test Form',
    pages: [{
      id: 'page-1',
      title: 'Page 1',
      components: [{
        id: 'text-1',
        type: 'text_input',
        label: 'Name',
        required: true,
        placeholder: 'Enter your name'
      }]
    }],
    onSubmit: mockOnSubmit,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with title and components', () => {
    render(<PreviewForm {...defaultProps} />);
    
    expect(screen.getByText('Test Form')).toBeInTheDocument();
    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<PreviewForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows validation errors for required fields', () => {
    render(<PreviewForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('navigates between pages in multi-page forms', () => {
    const multiPageProps = {
      ...defaultProps,
      pages: [
        ...defaultProps.pages,
        {
          id: 'page-2',
          title: 'Page 2',
          components: [{
            id: 'text-2',
            type: 'text_input',
            label: 'Email',
            required: true,
            placeholder: 'Enter your email'
          }]
        }
      ]
    };
    
    render(<PreviewForm {...multiPageProps} />);
    
    // Fill out first page and go to next
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } });
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    // Verify second page is shown
    expect(screen.getByText('Page 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    
    // Go back to first page
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    // Verify first page is shown again
    expect(screen.getByText('Page 1')).toBeInTheDocument();
  });
});
