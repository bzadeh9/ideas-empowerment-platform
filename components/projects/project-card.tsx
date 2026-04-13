'use client'

import type { ProjectSummary } from '@/lib/storage/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyIcon, ExternalLinkIcon, TrashIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState, useCallback } from 'react'

interface Props {
  project: ProjectSummary
  onOpen: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

function formatRelativeDate(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const statusVariant: Record<
  ProjectSummary['status'],
  'default' | 'secondary' | 'outline'
> = {
  draft: 'outline',
  'in-progress': 'secondary',
  complete: 'default',
}

export function ProjectCard({ project, onOpen, onDuplicate, onDelete }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleDelete = useCallback(() => {
    onDelete(project.id)
    setConfirmOpen(false)
  }, [onDelete, project.id])

  const excerpt =
    project.description.length > 100
      ? project.description.slice(0, 100) + '…'
      : project.description

  return (
    <>
      <div
        data-testid="project-card"
        className="flex flex-col justify-between rounded-lg border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-mono text-sm font-semibold leading-snug">
              {project.title}
            </h3>
            <Badge variant={statusVariant[project.status]}>
              {project.status}
            </Badge>
          </div>
          {excerpt && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {excerpt}
            </p>
          )}
          <p className="text-xs text-muted-foreground/70">
            Updated {formatRelativeDate(project.updatedAt)}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <Button
            size="sm"
            variant="default"
            onClick={() => onOpen(project.id)}
          >
            <ExternalLinkIcon className="mr-1 h-3 w-3" />
            Open
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDuplicate(project.id)}
          >
            <CopyIcon className="mr-1 h-3 w-3" />
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <TrashIcon className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{project.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
