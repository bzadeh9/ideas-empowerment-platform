'use client'

import type { WizardInput } from '@/lib/prompt-composer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  data: WizardInput
  onChange: (data: Partial<WizardInput>) => void
}

export function StepAudience({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wizard-target-users">Target Users</Label>
        <Input
          id="wizard-target-users"
          placeholder="e.g. Product managers, developers"
          value={data.targetUsers ?? ''}
          onChange={(e) => onChange({ targetUsers: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wizard-use-case">Primary Use Case</Label>
        <Input
          id="wizard-use-case"
          placeholder="e.g. Track sprint velocity and team metrics"
          value={data.primaryUseCase ?? ''}
          onChange={(e) => onChange({ primaryUseCase: e.target.value })}
        />
      </div>
    </div>
  )
}
