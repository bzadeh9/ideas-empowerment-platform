'use client'

import { TEST_PROMPTS } from '@/ai/constants'
import { TemplateCard } from './template-card'

interface Props {
  onUseTemplate: (prompt: string) => void
}

export function TemplateGallery({ onUseTemplate }: Props) {
  // Group templates by category
  const categories = Array.from(new Set(TEST_PROMPTS.map((t) => t.category)))

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Template Gallery</h2>
      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-xs font-medium text-muted-foreground mb-2">
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEST_PROMPTS.filter((t) => t.category === category).map(
              (template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={onUseTemplate}
                />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
