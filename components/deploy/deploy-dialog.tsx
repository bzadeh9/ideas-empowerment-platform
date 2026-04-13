'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RocketIcon } from 'lucide-react'
import { DeployInstructions } from './deploy-instructions'
import { DeployVercel } from './deploy-vercel'
import { ExportZip } from './export-zip'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  sandboxId?: string
}

type Tab = 'zip' | 'vercel' | 'other'

const tabs: { id: Tab; label: string }[] = [
  { id: 'zip', label: 'Export ZIP' },
  { id: 'vercel', label: 'Deploy to Vercel' },
  { id: 'other', label: 'Other Providers' },
]

export function DeployDialog({ sandboxId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('zip')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <RocketIcon className="w-4 h-4" />
          Deploy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Deploy Project</DialogTitle>
          <DialogDescription>
            Export or deploy your generated project.
          </DialogDescription>
        </DialogHeader>
        <div
          className="flex border-b border-border"
          role="tablist"
          aria-label="Deployment options"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={cn(
                'px-4 py-2 text-sm font-medium cursor-pointer transition-colors',
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div role="tabpanel">
          {activeTab === 'zip' && <ExportZip sandboxId={sandboxId} />}
          {activeTab === 'vercel' && <DeployVercel />}
          {activeTab === 'other' && <DeployInstructions />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
