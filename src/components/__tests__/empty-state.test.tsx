/**
 * Empty State Component Tests
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import EmptyState from '../empty-state'

describe('EmptyState Component', () => {
  it('should render with title and description', () => {
    render(<EmptyState title="No data available" description="There are no items to display" />)
    
    expect(screen.getByText('No data available')).toBeInTheDocument()
    expect(screen.getByText('There are no items to display')).toBeInTheDocument()
  })

  it('should render with custom title', () => {
    render(<EmptyState title="Custom Title" description="Custom description" />)
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('should render with description', () => {
    render(<EmptyState title="Test Title" description="This is a description" />)
    
    expect(screen.getByText('This is a description')).toBeInTheDocument()
  })

  it('should render with default icon', () => {
    render(<EmptyState title="Test Title" description="Test description" />)
    
    expect(screen.getByText('📋')).toBeInTheDocument()
  })

  it('should render with custom icon', () => {
    render(<EmptyState title="Test Title" description="Test description" icon="🎯" />)
    
    expect(screen.getByText('🎯')).toBeInTheDocument()
  })

  it('should render with action button', () => {
    const mockOnClick = jest.fn()
    render(
      <EmptyState 
        title="Test Title" 
        description="Test description"
        onAction={{ text: "Click me", onClick: mockOnClick }}
      />
    )
    
    const actionButton = screen.getByText('Click me')
    expect(actionButton).toBeInTheDocument()
    
    actionButton.click()
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})
