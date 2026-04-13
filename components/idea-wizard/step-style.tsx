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

export function StepStyle({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wizard-visual-style">Visual Style</Label>
        <Select
          value={data.visualStyle ?? ''}
          onValueChange={(value) =>
            onChange({
              visualStyle: value as WizardInput['visualStyle'],
            })
          }
        >
          <SelectTrigger id="wizard-visual-style" className="w-full">
            <SelectValue placeholder="Select visual style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
            <SelectItem value="playful">Playful</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="wizard-color">Color Preference</Label>
        <Input
          id="wizard-color"
          placeholder="e.g. Blue and white, dark theme"
          value={data.colorPreference ?? ''}
          onChange={(e) => onChange({ colorPreference: e.target.value })}
        />
      </div>
    </div>
  )
}
