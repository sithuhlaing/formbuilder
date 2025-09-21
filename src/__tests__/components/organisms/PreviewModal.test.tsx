import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { PreviewModal } from '../../../features/form-builder/components/PreviewModal';
import { TEST_IDS } from '../../utils/test-utils';

describe('PreviewModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    formTitle: 'Test Form',
    pages: [{
      id: 'page-1',
      title: 'Page 1',
      components: [{
        id: 'text-1',
        type: 'text_input',
        label: 'Test Input',
        required: false,
        placeholder: 'Enter text'
      }]
    }],
    onSubmit: mockOnSubmit
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    render(<PreviewModal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Preview: Test Form')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<PreviewModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<PreviewModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside the modal', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <PreviewModal {...defaultProps} />
      </div>
    );
    
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders PreviewForm with correct props', () => {
    render(<PreviewModal {...defaultProps} />);
    
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<PreviewModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('matches snapshot when open', () => {
    const { container } = render(<PreviewModal {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
