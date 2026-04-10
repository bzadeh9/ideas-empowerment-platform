import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrandingProvider, useBranding } from '@/lib/branding-context'
import { DEFAULT_BRANDING } from '@/lib/branding'

// Small helper that renders a consumer inside the provider
function BrandingConsumer() {
  const { branding, updateBranding, resetBranding } = useBranding()
  return (
    <div>
      <span data-testid="primary">{branding.primaryColor}</span>
      <span data-testid="logo">{branding.logoUrl}</span>
      <span data-testid="font">{branding.fontFamily}</span>
      <button onClick={() => updateBranding({ primaryColor: '#FF0000' })}>
        change
      </button>
      <button onClick={() => resetBranding()}>reset</button>
    </div>
  )
}

describe('BrandingContext', () => {
  beforeEach(() => {
    localStorage.clear()
    // Clean inline styles that applyBrandingToDOM may have added
    document.documentElement.removeAttribute('style')
  })

  it('provides default branding values', () => {
    render(
      <BrandingProvider>
        <BrandingConsumer />
      </BrandingProvider>
    )
    expect(screen.getByTestId('primary').textContent).toBe(
      DEFAULT_BRANDING.primaryColor
    )
    expect(screen.getByTestId('logo').textContent).toBe('')
    expect(screen.getByTestId('font').textContent).toBe('')
  })

  it('updates branding when updateBranding is called', () => {
    render(
      <BrandingProvider>
        <BrandingConsumer />
      </BrandingProvider>
    )
    fireEvent.click(screen.getByText('change'))
    expect(screen.getByTestId('primary').textContent).toBe('#FF0000')
  })

  it('persists branding to localStorage on update', () => {
    render(
      <BrandingProvider>
        <BrandingConsumer />
      </BrandingProvider>
    )
    fireEvent.click(screen.getByText('change'))
    const stored = JSON.parse(
      localStorage.getItem('platform-branding') ?? '{}'
    )
    expect(stored.primaryColor).toBe('#FF0000')
  })

  it('resets branding to defaults', () => {
    render(
      <BrandingProvider>
        <BrandingConsumer />
      </BrandingProvider>
    )
    fireEvent.click(screen.getByText('change'))
    expect(screen.getByTestId('primary').textContent).toBe('#FF0000')
    fireEvent.click(screen.getByText('reset'))
    expect(screen.getByTestId('primary').textContent).toBe(
      DEFAULT_BRANDING.primaryColor
    )
  })

  it('clears localStorage on reset', () => {
    render(
      <BrandingProvider>
        <BrandingConsumer />
      </BrandingProvider>
    )
    fireEvent.click(screen.getByText('change'))
    expect(localStorage.getItem('platform-branding')).not.toBeNull()
    fireEvent.click(screen.getByText('reset'))
    expect(localStorage.getItem('platform-branding')).toBeNull()
  })

  it('throws when useBranding is used outside provider', () => {
    expect(() => render(<BrandingConsumer />)).toThrow(
      /useBranding must be used within a BrandingProvider/
    )
  })
})
