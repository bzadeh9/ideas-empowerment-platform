'use client'

import { BrandingPanel } from '@/components/settings/branding-panel'
import { ToggleWelcome } from '@/components/modals/welcome'
import { CompanyLogo } from '@/components/icons/company-logo'
import { SaveProjectDialog } from '@/components/projects/save-project-dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getProjectStore } from '@/lib/storage/project-store'
import { useSandboxStore, useProjectStore } from './state'
import { FolderOpenIcon, CheckIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

interface Props {
  className?: string
}

export function Header({ className }: Props) {
  const router = useRouter()
  const { sandboxId, generatedFiles } = useSandboxStore()
  const { projectId, setProjectId, savedIndicator } = useProjectStore()

  const showSaved = useMemo(() => savedIndicator > 0, [savedIndicator])

  const handleSave = useCallback(
    async (title: string, description: string) => {
      const store = getProjectStore()
      if (projectId) {
        await store.update(projectId, { title, description })
      } else {
        const project = await store.create({
          title,
          description,
          chatHistory: [],
          fileManifest: [...generatedFiles].map((p) => ({ path: p })),
          sandboxConfig: { sandboxId },
          status: sandboxId ? 'in-progress' : 'draft',
        })
        setProjectId(project.id)
      }
    },
    [projectId, sandboxId, generatedFiles, setProjectId]
  )

  return (
    <header
      aria-label="Platform header"
      className={cn('flex items-center justify-between', className)}
      role="banner"
    >
      <div className="flex items-center">
        <CompanyLogo className="ml-1 md:ml-2.5 mr-1.5 text-primary" />
        <span className="hidden md:inline text-sm uppercase font-mono font-bold tracking-tight">
          Ideas Empowerment Platform
        </span>
      </div>
      <div className="flex items-center ml-auto space-x-1.5">
        {showSaved && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
            <CheckIcon className="h-3 w-3" />
            Saved
          </span>
        )}
        <SaveProjectDialog onSave={handleSave} />
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push('/projects')}
          data-testid="my-projects-button"
        >
          <FolderOpenIcon className="mr-1 h-3.5 w-3.5" />
          <span className="hidden sm:inline">My Projects</span>
        </Button>
        <BrandingPanel />
        <ThemeToggle />
        <ToggleWelcome />
      </div>
    </header>
  )
}
