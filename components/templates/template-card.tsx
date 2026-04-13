'use client'

import type { TestPrompt } from '@/ai/constants'
import { Button } from '@/components/ui/button'

interface Props {
  template: TestPrompt
  onUse: (prompt: string) => void
}

export function TemplateCard({ template, onUse }: Props) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-background p-4 shadow-xs hover:shadow-md transition-shadow">
      <span className="text-xs font-medium text-muted-foreground mb-1">
        {template.category}
      </span>
      <h3 className="text-sm font-semibold mb-1">{template.title}</h3>
      <p className="text-xs text-muted-foreground flex-1 mb-3">
        {template.description}
      </p>
      <Button
        size="sm"
        variant="outline"
        className="w-full cursor-pointer"
        onClick={() => onUse(template.prompt)}
      >
        Use Template
      </Button>
    </div>
  )
}
