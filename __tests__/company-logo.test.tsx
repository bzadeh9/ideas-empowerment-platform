import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompanyLogo } from '@/components/icons/company-logo'
import { BrandingProvider } from '@/lib/branding-context'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}))

describe('CompanyLogo', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('style')
  })

  it('renders the default PlatformLogo SVG when no logo URL is set', () => {
    const { container } = render(
      <BrandingProvider>
        <CompanyLogo />
      </BrandingProvider>
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders an img tag when a logo URL is configured', () => {
    localStorage.setItem(
      'platform-branding',
      JSON.stringify({
        primaryColor: '#4F46E5',
        secondaryColor: '#F1F5F9',
        logoUrl: 'https://example.com/logo.png',
        fontFamily: '',
      })
    )
    render(
      <BrandingProvider>
        <CompanyLogo />
      </BrandingProvider>
    )
    const img = screen.getByAltText('Company logo')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png')
  })

  it('applies the provided className', () => {
    const { container } = render(
      <BrandingProvider>
        <CompanyLogo className="text-red-500" />
      </BrandingProvider>
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-red-500')
  })
})
