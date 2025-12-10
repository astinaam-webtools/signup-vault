import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label', () => {
  it('renders with text', () => {
    render(<Label>Email Address</Label>)
    const label = screen.getByText('Email Address')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
  })

  it('applies custom className', () => {
    render(<Label className="custom-label">Test</Label>)
    const label = screen.getByText('Test')
    expect(label).toHaveClass('custom-label')
  })

  it('forwards htmlFor prop', () => {
    render(<Label htmlFor="email-input">Email</Label>)
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email-input')
  })
})