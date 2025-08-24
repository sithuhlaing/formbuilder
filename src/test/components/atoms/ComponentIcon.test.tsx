
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ComponentIcon from './ComponentIcon';
import { ComponentType } from '../types';

describe('ComponentIcon', () => {
  it('should render the text input icon', () => {
    render(<ComponentIcon type="text_input" />);
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  // This is our new test that will fail
  it('should render the number input icon for the new "number_input" type', () => {
    // We cast here because the type doesn't exist yet in our main codebase
    render(<ComponentIcon type={'number_input' as ComponentType} />);
    expect(screen.getByText('🔢')).toBeInTheDocument();
  });

  it('should render the default icon for an unknown type', () => {
    render(<ComponentIcon type={'unknown_type' as ComponentType} />);
    expect(screen.getByText('❓')).toBeInTheDocument();
  });
});
