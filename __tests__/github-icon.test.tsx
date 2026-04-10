import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { GithubIcon } from '@/components/icons/github'

describe('GithubIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<GithubIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('accepts a custom className', () => {
    const { container } = render(<GithubIcon className="custom-class" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('custom-class')
  })
})
