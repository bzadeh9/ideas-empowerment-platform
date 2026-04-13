import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeployDialog } from '@/components/deploy/deploy-dialog'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}))

describe('DeployDialog', () => {
  it('renders the Deploy button', () => {
    render(<DeployDialog />)
    expect(screen.getByText('Deploy')).toBeInTheDocument()
  })

  it('opens the dialog when Deploy button is clicked', () => {
    render(<DeployDialog />)
    fireEvent.click(screen.getByText('Deploy'))
    expect(screen.getByText('Deploy Project')).toBeInTheDocument()
    expect(
      screen.getByText('Export or deploy your generated project.')
    ).toBeInTheDocument()
  })

  it('renders three tabs', () => {
    render(<DeployDialog />)
    fireEvent.click(screen.getByText('Deploy'))
    expect(screen.getByText('Export ZIP')).toBeInTheDocument()
    expect(screen.getByText('Deploy to Vercel')).toBeInTheDocument()
    expect(screen.getByText('Other Providers')).toBeInTheDocument()
  })

  it('shows Export ZIP tab content by default', () => {
    render(<DeployDialog sandboxId="test-sandbox" />)
    fireEvent.click(screen.getByText('Deploy'))
    expect(
      screen.getByText('Download all generated project files as a ZIP archive.')
    ).toBeInTheDocument()
  })

  it('switches to Vercel tab when clicked', () => {
    render(<DeployDialog />)
    fireEvent.click(screen.getByText('Deploy'))
    fireEvent.click(screen.getByText('Deploy to Vercel'))
    expect(
      screen.getByText('Deploy your project to Vercel in three steps:')
    ).toBeInTheDocument()
  })

  it('switches to Other Providers tab when clicked', () => {
    render(<DeployDialog />)
    fireEvent.click(screen.getByText('Deploy'))
    fireEvent.click(screen.getByText('Other Providers'))
    expect(screen.getByText('AWS Amplify')).toBeInTheDocument()
    expect(screen.getByText('Google Cloud Run')).toBeInTheDocument()
    expect(screen.getByText('Azure Static Web Apps')).toBeInTheDocument()
  })

  it('supports keyboard navigation between tabs', () => {
    render(<DeployDialog />)
    fireEvent.click(screen.getByText('Deploy'))

    const firstTab = screen.getByRole('tab', { name: 'Export ZIP' })
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
    expect(
      screen.getByText('Deploy your project to Vercel in three steps:')
    ).toBeInTheDocument()

    const secondTab = screen.getByRole('tab', { name: 'Deploy to Vercel' })
    fireEvent.keyDown(secondTab, { key: 'ArrowRight' })
    expect(screen.getByText('AWS Amplify')).toBeInTheDocument()

    const thirdTab = screen.getByRole('tab', { name: 'Other Providers' })
    fireEvent.keyDown(thirdTab, { key: 'ArrowLeft' })
    expect(
      screen.getByText('Deploy your project to Vercel in three steps:')
    ).toBeInTheDocument()
  })
})
