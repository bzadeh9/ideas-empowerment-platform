import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IdeaWizard } from '@/components/idea-wizard/idea-wizard'

// Mock Radix Dialog to render inline for test
vi.mock('@radix-ui/react-dialog', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')
  return {
    Root: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
      open
        ? React.createElement('div', { 'data-slot': 'dialog' }, children)
        : null,
    Portal: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    Overlay: () => null,
    Content: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => React.createElement('div', props, children),
    Title: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => React.createElement('h2', props, children),
    Description: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => React.createElement('p', props, children),
    Close: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => React.createElement('button', props, children),
    Trigger: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => React.createElement('button', props, children),
  }
})

// Mock Radix Select to render as native select for tests
vi.mock('@radix-ui/react-select', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')
  return {
    Root: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    Trigger: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => React.createElement('button', props, children),
    Value: ({ placeholder }: { placeholder?: string }) =>
      React.createElement('span', null, placeholder ?? ''),
    Portal: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    Content: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    Viewport: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    Item: ({
      children,
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => React.createElement('div', null, children),
    ItemText: ({ children }: { children: React.ReactNode }) =>
      React.createElement('span', null, children),
    ItemIndicator: () => null,
    ScrollUpButton: () => null,
    ScrollDownButton: () => null,
    Group: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    Label: ({ children }: { children: React.ReactNode }) =>
      React.createElement('span', null, children),
    Separator: () => null,
    Icon: ({ children }: { children: React.ReactNode }) =>
      React.createElement('span', null, children),
  }
})

describe('IdeaWizard', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onGenerate: vi.fn(),
  }

  it('renders step 1 by default', () => {
    render(<IdeaWizard {...defaultProps} />)
    expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 4 — Problem/)).toBeInTheDocument()
    expect(screen.getByLabelText('Idea Title')).toBeInTheDocument()
  })

  it('navigates to step 2 on Next click', () => {
    render(<IdeaWizard {...defaultProps} />)
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText(/Step 2 of 4/)).toBeInTheDocument()
    expect(screen.getByText(/Audience/)).toBeInTheDocument()
  })

  it('navigates back from step 2', () => {
    render(<IdeaWizard {...defaultProps} />)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument()
  })

  it('shows Generate button on last step', () => {
    render(<IdeaWizard {...defaultProps} />)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText(/Step 4 of 4/)).toBeInTheDocument()
    expect(screen.getByText('Generate')).toBeInTheDocument()
  })

  it('calls onGenerate when Generate is clicked', () => {
    const onGenerate = vi.fn()
    render(<IdeaWizard {...defaultProps} onGenerate={onGenerate} />)
    // Navigate to last step
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Generate'))
    expect(onGenerate).toHaveBeenCalledTimes(1)
    expect(typeof onGenerate.mock.calls[0][0]).toBe('string')
  })

  it('Back button is disabled on step 1', () => {
    render(<IdeaWizard {...defaultProps} />)
    const backButton = screen.getByText('Back')
    expect(backButton).toBeDisabled()
  })

  it('does not render when open is false', () => {
    render(<IdeaWizard {...defaultProps} open={false} />)
    expect(screen.queryByText('Idea Wizard')).not.toBeInTheDocument()
  })
})
