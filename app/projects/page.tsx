'use client'

import type { ProjectSummary } from '@/lib/storage/types'
import { ProjectCard } from '@/components/projects/project-card'
import { Button } from '@/components/ui/button'
import { getProjectStore } from '@/lib/storage/project-store'
import { PlusCircleIcon, FolderOpenIcon } from 'lucide-react'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

async function fetchProjects(): Promise<ProjectSummary[]> {
  const store = getProjectStore()
  return store.getAll()
}

export default function ProjectsPage() {
  const {
    data: projects,
    isLoading: loading,
    mutate,
  } = useSWR('projects', fetchProjects, { fallbackData: [] })
  const router = useRouter()

  const handleOpen = useCallback(
    (id: string) => {
      router.push(`/?projectId=${id}`)
    },
    [router]
  )

  const handleDuplicate = useCallback(
    async (id: string) => {
      const store = getProjectStore()
      const project = await store.getById(id)
      if (!project) return
      await store.create({
        title: `${project.title} (copy)`,
        description: project.description,
        chatHistory: project.chatHistory,
        fileManifest: project.fileManifest,
        sandboxConfig: project.sandboxConfig,
        status: 'draft',
      })
      mutate()
    },
    [mutate]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      const store = getProjectStore()
      await store.delete(id)
      mutate()
    },
    [mutate]
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground">
          Loading projects…
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpenIcon className="h-5 w-5 text-primary" />
          <h1 className="font-mono text-lg font-bold uppercase tracking-tight">
            My Projects
          </h1>
        </div>
        <Button onClick={() => router.push('/')}>
          <PlusCircleIcon className="mr-1 h-4 w-4" />
          New Idea
        </Button>
      </div>

      {projects && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
          <FolderOpenIcon className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="mb-2 font-mono text-sm font-semibold">
            No projects yet
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Start a new idea and save it to see it here.
          </p>
          <Button onClick={() => router.push('/')}>
            <PlusCircleIcon className="mr-1 h-4 w-4" />
            Start a New Idea
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={handleOpen}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
