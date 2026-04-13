import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeployInstructions } from '@/components/deploy/deploy-instructions'

describe('DeployInstructions', () => {
  it('renders all three providers', () => {
    render(<DeployInstructions />)
    expect(screen.getByText('AWS Amplify')).toBeInTheDocument()
    expect(screen.getByText('Google Cloud Run')).toBeInTheDocument()
    expect(screen.getByText('Azure Static Web Apps')).toBeInTheDocument()
  })

  it('renders CLI commands for AWS', () => {
    render(<DeployInstructions />)
    expect(
      screen.getByText('npm install -g @aws-amplify/cli')
    ).toBeInTheDocument()
    expect(screen.getByText('amplify init')).toBeInTheDocument()
    expect(screen.getByText('amplify publish')).toBeInTheDocument()
  })

  it('renders CLI commands for GCP', () => {
    render(<DeployInstructions />)
    expect(screen.getByText('gcloud run deploy --source .')).toBeInTheDocument()
  })

  it('renders CLI commands for Azure', () => {
    render(<DeployInstructions />)
    expect(
      screen.getByText('npm install -g @azure/static-web-apps-cli')
    ).toBeInTheDocument()
    expect(screen.getByText('swa init')).toBeInTheDocument()
    expect(screen.getByText('swa deploy')).toBeInTheDocument()
  })

  it('has copy buttons for each command', () => {
    render(<DeployInstructions />)
    const copyButtons = screen.getAllByRole('button')
    // 3 AWS commands + 1 GCP command + 3 Azure commands = 7
    expect(copyButtons).toHaveLength(7)
  })

  it('copies command text when copy button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    })

    render(<DeployInstructions />)
    const copyButtons = screen.getAllByRole('button')
    fireEvent.click(copyButtons[0])

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        'npm install -g @aws-amplify/cli'
      )
    })
  })
})
