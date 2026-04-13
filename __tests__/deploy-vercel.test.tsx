import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DeployVercel } from '@/components/deploy/deploy-vercel'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}))

describe('DeployVercel', () => {
  it('renders the three deployment steps', () => {
    render(<DeployVercel />)
    expect(screen.getByText(/Export your project/)).toBeInTheDocument()
    expect(screen.getByText(/Push to GitHub/)).toBeInTheDocument()
    expect(
      screen.getByText(/Import to Vercel/, { selector: 'strong' })
    ).toBeInTheDocument()
  })

  it('renders the Import to Vercel link', () => {
    render(<DeployVercel />)
    const link = screen.getByRole('link', { name: /Import to Vercel/i })
    expect(link).toHaveAttribute('href', 'https://vercel.com/import/git')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
