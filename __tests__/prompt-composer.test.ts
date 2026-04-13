import { describe, it, expect } from 'vitest'
import { composePrompt, type WizardInput } from '@/lib/prompt-composer'

describe('composePrompt', () => {
  it('returns a non-empty string with empty input', () => {
    const result = composePrompt({})
    expect(result).toBe('Build an application.')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes the title when provided', () => {
    const result = composePrompt({ title: 'My App' })
    expect(result).toContain('My App')
  })

  it('includes the problem statement when provided', () => {
    const result = composePrompt({ problemStatement: 'Users need dashboards' })
    expect(result).toContain('Users need dashboards')
  })

  it('includes target users when provided', () => {
    const result = composePrompt({ targetUsers: 'Product managers' })
    expect(result).toContain('Product managers')
  })

  it('includes primary use case when provided', () => {
    const result = composePrompt({ primaryUseCase: 'Track team velocity' })
    expect(result).toContain('Track team velocity')
  })

  it('includes stack type label when provided', () => {
    const result = composePrompt({ stackType: 'fullstack' })
    expect(result).toContain('Full-stack')
  })

  it('includes frontend stack type', () => {
    const result = composePrompt({ stackType: 'frontend' })
    expect(result).toContain('Frontend only')
  })

  it('includes api stack type', () => {
    const result = composePrompt({ stackType: 'api' })
    expect(result).toContain('API / Backend service')
  })

  it('includes preferred language when provided', () => {
    const result = composePrompt({ preferredLanguage: 'TypeScript' })
    expect(result).toContain('TypeScript')
  })

  it('includes visual style label when provided', () => {
    const result = composePrompt({ visualStyle: 'modern' })
    expect(result).toContain('modern and polished')
  })

  it('maps minimal visual style correctly', () => {
    const result = composePrompt({ visualStyle: 'minimal' })
    expect(result).toContain('minimal and clean')
  })

  it('maps enterprise visual style correctly', () => {
    const result = composePrompt({ visualStyle: 'enterprise' })
    expect(result).toContain('enterprise and professional')
  })

  it('maps playful visual style correctly', () => {
    const result = composePrompt({ visualStyle: 'playful' })
    expect(result).toContain('playful and colorful')
  })

  it('includes color preference when provided', () => {
    const result = composePrompt({ colorPreference: 'Blue and white' })
    expect(result).toContain('Blue and white')
  })

  it('composes a full prompt with all fields', () => {
    const input: WizardInput = {
      title: 'Dashboard',
      problemStatement: 'Teams lack visibility',
      targetUsers: 'Engineering leads',
      primaryUseCase: 'Sprint reviews',
      stackType: 'fullstack',
      preferredLanguage: 'TypeScript',
      visualStyle: 'modern',
      colorPreference: 'Dark theme',
    }
    const result = composePrompt(input)
    expect(result).toContain('Dashboard')
    expect(result).toContain('Teams lack visibility')
    expect(result).toContain('Engineering leads')
    expect(result).toContain('Sprint reviews')
    expect(result).toContain('Full-stack')
    expect(result).toContain('TypeScript')
    expect(result).toContain('modern and polished')
    expect(result).toContain('Dark theme')
  })

  it('composes partial prompt correctly', () => {
    const input: WizardInput = {
      title: 'Todo App',
      stackType: 'frontend',
    }
    const result = composePrompt(input)
    expect(result).toContain('Todo App')
    expect(result).toContain('Frontend only')
    expect(result).not.toContain('problem')
    expect(result).not.toContain('target')
  })

  it('always returns a non-empty string', () => {
    const inputs: WizardInput[] = [
      {},
      { title: '' },
      { problemStatement: '' },
      { title: 'X' },
      { stackType: 'api' },
    ]
    for (const input of inputs) {
      const result = composePrompt(input)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    }
  })
})
