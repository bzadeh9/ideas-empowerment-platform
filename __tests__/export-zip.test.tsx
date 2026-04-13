import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportZip } from '@/components/deploy/export-zip'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}))

describe('ExportZip', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows message when no sandboxId is provided', () => {
    render(<ExportZip />)
    expect(
      screen.getByText('Generate files first to export them as a ZIP archive.')
    ).toBeInTheDocument()
  })

  it('renders download button when sandboxId is provided', () => {
    render(<ExportZip sandboxId="test-sandbox" />)
    expect(screen.getByText('Download ZIP')).toBeInTheDocument()
  })

  it('shows loading state during download', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                new Response(new Blob(['test']), {
                  status: 200,
                  headers: { 'Content-Type': 'application/zip' },
                })
              ),
            100
          )
        )
    )

    render(<ExportZip sandboxId="test-sandbox" />)
    fireEvent.click(screen.getByText('Download ZIP'))
    expect(screen.getByText('Downloading...')).toBeInTheDocument()
  })

  it('shows error message on failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Sandbox not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    render(<ExportZip sandboxId="test-sandbox" />)
    fireEvent.click(screen.getByText('Download ZIP'))

    await waitFor(() => {
      expect(screen.getByText('Sandbox not found')).toBeInTheDocument()
    })
  })

  it('calls fetch with correct parameters on download', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(new Blob(['fake-zip']), {
        status: 200,
        headers: { 'Content-Type': 'application/zip' },
      })
    )

    global.URL.createObjectURL = vi.fn(() => 'blob:test-url')
    global.URL.revokeObjectURL = vi.fn()

    render(<ExportZip sandboxId="test-sandbox" />)
    fireEvent.click(screen.getByText('Download ZIP'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sandboxId: 'test-sandbox' }),
      })
    })
  })
})
