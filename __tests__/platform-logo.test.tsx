import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PlatformLogo } from '@/components/icons/platform-logo'

describe('PlatformLogo', () => {
  it('renders an SVG element', () => {
    const { container } = render(<PlatformLogo />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('has aria-hidden attribute for decorative icon', () => {
    const { container } = render(<PlatformLogo />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('accepts a custom className', () => {
    const { container } = render(<PlatformLogo className="text-red-500" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-red-500')
  })
})
