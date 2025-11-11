import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import App from '../App'

describe('Basic App', () => {
  it('renders without crashing', () => {
    render(React.createElement(App))
    expect(screen.getByText('Form Builder')).toBeInTheDocument()
  })

  it('shows welcome message', () => {
    render(React.createElement(App))
    expect(screen.getByText('Welcome to Form Builder')).toBeInTheDocument()
  })
})
