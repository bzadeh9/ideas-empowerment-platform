import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Welcome, ToggleWelcome, useWelcomeStore } from '@/components/modals/welcome'

// Mock next-themes for components that might use it indirectly
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}))

describe('Welcome modal', () => {
  beforeEach(() => {
    // Reset the zustand store between tests
    useWelcomeStore.setState({ open: undefined })
  })

  it('renders when defaultOpen is true', () => {
    render(<Welcome defaultOpen={true} onDismissAction={() => {}} />)
    expect(screen.getByText('Ideas Empowerment Platform')).toBeInTheDocument()
  })

  it('does not render when defaultOpen is false', () => {
    render(<Welcome defaultOpen={false} onDismissAction={() => {}} />)
    expect(
      screen.queryByText('Ideas Empowerment Platform')
    ).not.toBeInTheDocument()
  })

  it('has correct ARIA role and attributes', () => {
    render(<Welcome defaultOpen={true} onDismissAction={() => {}} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Welcome dialog')
  })

  it('calls onDismissAction and closes when Get started button is clicked', () => {
    const onDismiss = vi.fn()
    render(<Welcome defaultOpen={true} onDismissAction={onDismiss} />)

    const button = screen.getByText('Get started')
    fireEvent.click(button)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('closes when Escape key is pressed', () => {
    const onDismiss = vi.fn()
    render(<Welcome defaultOpen={true} onDismissAction={onDismiss} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('contains expected content about the platform', () => {
    render(<Welcome defaultOpen={true} onDismissAction={() => {}} />)
    expect(
      screen.getByText(/end-to-end coding platform/i)
    ).toBeInTheDocument()
  })
})

describe('ToggleWelcome', () => {
  it('renders the info button', () => {
    render(<ToggleWelcome />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('contains "What\'s this?" text', () => {
    render(<ToggleWelcome />)
    expect(screen.getByText("What's this?")).toBeInTheDocument()
  })
})
