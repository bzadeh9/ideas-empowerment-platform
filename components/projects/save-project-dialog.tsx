'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SaveIcon } from 'lucide-react'
import { useState, useCallback } from 'react'

interface Props {
  defaultTitle?: string
  onSave: (title: string, description: string) => void
}

export function SaveProjectDialog({ defaultTitle, onSave }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleOpen = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setTitle(defaultTitle ?? '')
        setDescription('')
      }
      setOpen(isOpen)
    },
    [defaultTitle]
  )

  const handleSave = useCallback(() => {
    if (!title.trim()) return
    onSave(title.trim(), description.trim())
    setOpen(false)
  }, [title, description, onSave])

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" data-testid="save-project-button">
          <SaveIcon className="mr-1 h-3.5 w-3.5" />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Project</DialogTitle>
          <DialogDescription>
            Give your project a name so you can find it later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="project-title">Title</Label>
            <Input
              id="project-title"
              placeholder="My awesome idea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description (optional)</Label>
            <Input
              id="project-description"
              placeholder="A brief description of your project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
