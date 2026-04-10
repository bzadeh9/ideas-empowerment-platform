import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { VercelDashed } from '@/components/icons/vercel-dashed'

describe('VercelDashed', () => {
  it('renders an SVG element', () => {
    const { container } = render(<VercelDashed />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('accepts a custom className', () => {
    const { container } = render(<VercelDashed className="my-class" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('my-class')
  })
})
