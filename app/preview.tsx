'use client'

import { Preview as PreviewComponent } from '@/components/preview/preview'
import { useSandboxStore } from './state'

interface Props {
  className?: string
}

export function Preview({ className }: Props) {
  const { sandboxId, status, url, urlUUID } = useSandboxStore()
  return (
    <PreviewComponent
      key={urlUUID}
      className={className}
      disabled={status === 'stopped'}
      sandboxId={sandboxId}
      url={url}
    />
  )
}
