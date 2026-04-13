export interface WizardInput {
  title?: string
  problemStatement?: string
  targetUsers?: string
  primaryUseCase?: string
  stackType?: 'frontend' | 'fullstack' | 'api'
  preferredLanguage?: string
  visualStyle?: 'minimal' | 'modern' | 'enterprise' | 'playful'
  colorPreference?: string
}

const STACK_LABELS: Record<string, string> = {
  frontend: 'Frontend only',
  fullstack: 'Full-stack',
  api: 'API / Backend service',
}

const STYLE_LABELS: Record<string, string> = {
  minimal: 'minimal and clean',
  modern: 'modern and polished',
  enterprise: 'enterprise and professional',
  playful: 'playful and colorful',
}

export function composePrompt(input: WizardInput): string {
  const parts: string[] = []

  if (input.title) {
    parts.push(`Build an application called "${input.title}".`)
  } else {
    parts.push('Build an application.')
  }

  if (input.problemStatement) {
    parts.push(
      `It should solve the following problem: ${input.problemStatement}`
    )
  }

  if (input.targetUsers) {
    parts.push(`The target users are: ${input.targetUsers}.`)
  }

  if (input.primaryUseCase) {
    parts.push(`The primary use case is: ${input.primaryUseCase}.`)
  }

  if (input.stackType) {
    const label = STACK_LABELS[input.stackType] ?? input.stackType
    parts.push(`Tech stack: ${label}.`)
  }

  if (input.preferredLanguage) {
    parts.push(`Preferred language/framework: ${input.preferredLanguage}.`)
  }

  if (input.visualStyle) {
    const label = STYLE_LABELS[input.visualStyle] ?? input.visualStyle
    parts.push(`Use a ${label} visual style.`)
  }

  if (input.colorPreference) {
    parts.push(`Color preference: ${input.colorPreference}.`)
  }

  return parts.join(' ')
}
