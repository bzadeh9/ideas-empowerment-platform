'use client'

import type { WizardInput } from '@/lib/prompt-composer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  data: WizardInput
  onChange: (data: Partial<WizardInput>) => void
}

export function StepProblem({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wizard-title">Idea Title</Label>
        <Input
          id="wizard-title"
          placeholder="e.g. Team Analytics Dashboard"
          value={data.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wizard-problem">Problem Statement</Label>
        <Textarea
          id="wizard-problem"
          placeholder="Describe the problem your idea solves..."
          value={data.problemStatement ?? ''}
          onChange={(e) => onChange({ problemStatement: e.target.value })}
        />
      </div>
    </div>
  )
}
