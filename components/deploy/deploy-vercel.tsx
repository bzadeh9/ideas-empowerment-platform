'use client'

import { Button } from '@/components/ui/button'
import { ExternalLinkIcon } from 'lucide-react'

export function DeployVercel() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Deploy your project to Vercel in three steps:
      </p>
      <ol className="list-decimal list-inside space-y-3 text-sm">
        <li>
          <strong>Export your project</strong> — Download the ZIP from the
          &quot;Export ZIP&quot; tab.
        </li>
        <li>
          <strong>Push to GitHub</strong> — Unzip the files and push them to a
          GitHub repository.
        </li>
        <li>
          <strong>Import to Vercel</strong> — Click the button below to import
          your repository.
        </li>
      </ol>
      <Button asChild>
        <a
          href="https://vercel.com/import/git"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLinkIcon className="w-4 h-4" />
          Import to Vercel
        </a>
      </Button>
    </div>
  )
}
