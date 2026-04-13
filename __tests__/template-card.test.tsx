import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateCard } from '@/components/templates/template-card'
import type { TestPrompt } from '@/ai/constants'

describe('TemplateCard', () => {
  const template: TestPrompt = {
    id: 'test-template',
    category: 'Test Category',
    title: 'Test Template',
    prompt: 'Build a test app',
    description: 'A test template description.',
  }

  it('renders the template title', () => {
    render(<TemplateCard template={template} onUse={vi.fn()} />)
    expect(screen.getByText('Test Template')).toBeInTheDocument()
  })

  it('renders the category', () => {
    render(<TemplateCard template={template} onUse={vi.fn()} />)
    expect(screen.getByText('Test Category')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<TemplateCard template={template} onUse={vi.fn()} />)
    expect(screen.getByText('A test template description.')).toBeInTheDocument()
  })

  it('renders Use Template button', () => {
    render(<TemplateCard template={template} onUse={vi.fn()} />)
    expect(screen.getByText('Use Template')).toBeInTheDocument()
  })

  it('calls onUse with prompt when clicked', () => {
    const onUse = vi.fn()
    render(<TemplateCard template={template} onUse={onUse} />)
    fireEvent.click(screen.getByText('Use Template'))
    expect(onUse).toHaveBeenCalledWith('Build a test app')
  })

  it('matches snapshot', () => {
    const { container } = render(
      <TemplateCard template={template} onUse={vi.fn()} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
