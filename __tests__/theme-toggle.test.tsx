import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/theme-toggle'

// Mock next-themes
let mockTheme = 'light'
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockTheme,
    setTheme: (theme: string) => {
      mockTheme = theme
    },
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockTheme = 'light'
  })

  it('renders the toggle button', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(button).toBeInTheDocument()
  })

  it('has accessible label for light mode', () => {
    render(<ThemeToggle />)
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i })
    ).toBeInTheDocument()
  })

  it('has accessible label for dark mode', () => {
    mockTheme = 'dark'
    render(<ThemeToggle />)
    expect(
      screen.getByRole('button', { name: /switch to light mode/i })
    ).toBeInTheDocument()
  })

  it('contains a sr-only span for screen readers', () => {
    render(<ThemeToggle />)
    expect(screen.getByText('Toggle theme')).toHaveClass('sr-only')
  })

  it('calls setTheme when clicked', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    // After clicking in light mode, it should try to set dark
    expect(mockTheme).toBe('dark')
  })
})
