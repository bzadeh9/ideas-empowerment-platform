'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StepProblem } from './step-problem'
import { StepAudience } from './step-audience'
import { StepTech } from './step-tech'
import { StepStyle } from './step-style'
import { composePrompt, type WizardInput } from '@/lib/prompt-composer'

const STEPS = [
  { label: 'Problem', component: StepProblem },
  { label: 'Audience', component: StepAudience },
  { label: 'Tech', component: StepTech },
  { label: 'Style', component: StepStyle },
] as const

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (prompt: string) => void
}

export function IdeaWizard({ open, onOpenChange, onGenerate }: Props) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardInput>({})

  const handleChange = useCallback((partial: Partial<WizardInput>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
  }, [])

  const handleGenerate = useCallback(() => {
    const prompt = composePrompt(data)
    onGenerate(prompt)
    onOpenChange(false)
    setStep(0)
    setData({})
  }, [data, onGenerate, onOpenChange])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen)
      if (!nextOpen) {
        setStep(0)
        setData({})
      }
    },
    [onOpenChange]
  )

  const StepComponent = STEPS[step].component
  const isLastStep = step === STEPS.length - 1

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Idea Wizard</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} — {STEPS[step].label}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div
          className="flex gap-1"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <StepComponent data={data} onChange={handleChange} />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            Back
          </Button>
          {isLastStep ? (
            <Button type="button" onClick={handleGenerate}>
              Generate
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
