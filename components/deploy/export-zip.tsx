'use client'

import { Button } from '@/components/ui/button'
import { DownloadIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'

interface Props {
  sandboxId?: string
}

export function ExportZip({ sandboxId }: Props) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (!sandboxId) return
    setIsDownloading(true)
    setError(null)

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sandboxId }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate ZIP file')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'project.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download ZIP')
    } finally {
      setIsDownloading(false)
    }
  }

  if (!sandboxId) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Generate files first to export them as a ZIP archive.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Download all generated project files as a ZIP archive.
      </p>
      <Button onClick={handleDownload} disabled={isDownloading}>
        {isDownloading ? (
          <Loader2Icon className="w-4 h-4 animate-spin" />
        ) : (
          <DownloadIcon className="w-4 h-4" />
        )}
        {isDownloading ? 'Downloading...' : 'Download ZIP'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
