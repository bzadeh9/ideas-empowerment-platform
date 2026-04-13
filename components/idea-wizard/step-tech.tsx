'use client'

import type { WizardInput } from '@/lib/prompt-composer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  data: WizardInput
  onChange: (data: Partial<WizardInput>) => void
}

export function StepTech({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wizard-stack">Stack Type</Label>
        <Select
          value={data.stackType ?? ''}
          onValueChange={(value) =>
            onChange({
              stackType: value as WizardInput['stackType'],
            })
          }
        >
          <SelectTrigger id="wizard-stack" className="w-full">
            <SelectValue placeholder="Select stack type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="frontend">Frontend only</SelectItem>
            <SelectItem value="fullstack">Full-stack</SelectItem>
            <SelectItem value="api">API / Backend service</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="wizard-language">Preferred Language / Framework</Label>
        <Input
          id="wizard-language"
          placeholder="e.g. TypeScript, Python, Go"
          value={data.preferredLanguage ?? ''}
          onChange={(e) => onChange({ preferredLanguage: e.target.value })}
        />
      </div>
    </div>
  )
}
