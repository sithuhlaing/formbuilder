import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { PreviewForm } from '../../../features/form-builder/components/PreviewForm';

describe('PreviewForm', () => {
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    templateName: 'Test Form',
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with pages and components', () => {
    render(<PreviewForm {...defaultProps} />);

    // Check for component label and input by placeholder
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    // Check for label using role
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
  });

  it('renders single page mode with components prop', () => {
    const singlePageProps = {
      templateName: 'Single Page Form',
      components: [{
        id: 'email-1',
        type: 'email_input',
        label: 'Email',
        required: true,
        placeholder: 'Enter your email'
      }],
      onSubmit: mockOnSubmit,
    };

    render(<PreviewForm {...singlePageProps} />);

    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
  });

  it('renders form with submit button', () => {
    render(<PreviewForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /submit form/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('handles multi-page navigation', () => {
    const multiPageProps = {
      ...defaultProps,
      pages: [
        {
          id: 'page-1',
          title: 'Page 1',
          components: [{ id: 'text-1', type: 'text_input', label: 'Name', required: true }]
        },
        {
          id: 'page-2',
          title: 'Page 2',
          components: [{ id: 'email-1', type: 'email_input', label: 'Email', required: true }]
        }
      ]
    };

    render(<PreviewForm {...multiPageProps} />);

    // Check that the first page content is visible by role
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();

    // Check if there's navigation (Next button)
    const nextButton = screen.queryByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();
  });
});