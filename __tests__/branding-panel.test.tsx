import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrandingPanel } from '@/components/settings/branding-panel'
import { BrandingProvider } from '@/lib/branding-context'

// Mock next-themes (some shadcn components may reference it)
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}))

function renderPanel() {
  return render(
    <BrandingProvider>
      <BrandingPanel />
    </BrandingProvider>
  )
}

describe('BrandingPanel', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('style')
  })

  it('renders the trigger button with palette icon', () => {
    renderPanel()
    const button = screen.getByRole('button', {
      name: /customize branding/i,
    })
    expect(button).toBeInTheDocument()
  })

  it('opens the popover when the trigger is clicked', () => {
    renderPanel()
    fireEvent.click(
      screen.getByRole('button', { name: /customize branding/i })
    )
    expect(screen.getByText('Company Branding')).toBeInTheDocument()
  })

  it('shows the Apply and Reset buttons', () => {
    renderPanel()
    fireEvent.click(
      screen.getByRole('button', { name: /customize branding/i })
    )
    expect(screen.getByText('Apply')).toBeInTheDocument()
    expect(screen.getByText('Reset')).toBeInTheDocument()
  })

  it('shows WCAG warning for low-contrast colour', () => {
    renderPanel()
    fireEvent.click(
      screen.getByRole('button', { name: /customize branding/i })
    )
    // Set a very light primary that will fail WCAG AA on white
    const hexInput = screen.getByLabelText('Primary color hex')
    fireEvent.change(hexInput, { target: { value: '#EEEEEE' } })
    expect(
      screen.getByText(/low contrast/i)
    ).toBeInTheDocument()
  })

  it('does not show WCAG warning for high-contrast colour', () => {
    renderPanel()
    fireEvent.click(
      screen.getByRole('button', { name: /customize branding/i })
    )
    const hexInput = screen.getByLabelText('Primary color hex')
    fireEvent.change(hexInput, { target: { value: '#000000' } })
    expect(screen.queryByText(/low contrast/i)).not.toBeInTheDocument()
  })

  it('persists branding to localStorage when Apply is clicked', () => {
    renderPanel()
    fireEvent.click(
      screen.getByRole('button', { name: /customize branding/i })
    )
    const hexInput = screen.getByLabelText('Primary color hex')
    fireEvent.change(hexInput, { target: { value: '#FF0000' } })
    fireEvent.click(screen.getByText('Apply'))
    const stored = JSON.parse(
      localStorage.getItem('platform-branding') ?? '{}'
    )
    expect(stored.primaryColor).toBe('#FF0000')
  })

  it('clears localStorage when Reset is clicked', () => {
    renderPanel()
    fireEvent.click(
      screen.getByRole('button', { name: /customize branding/i })
    )
    fireEvent.click(screen.getByText('Apply'))
    fireEvent.click(screen.getByText('Reset'))
    expect(localStorage.getItem('platform-branding')).toBeNull()
  })
})
