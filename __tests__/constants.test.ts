import { describe, it, expect } from 'vitest'
import {
  Models,
  DEFAULT_MODEL,
  SUPPORTED_MODELS,
  MODEL_NAMES,
  TEST_PROMPTS,
} from '@/ai/constants'

describe('AI constants', () => {
  it('defines all model enum values', () => {
    expect(Models.AnthropicClaudeOpus46).toBe('anthropic/claude-opus-4.6')
    expect(Models.AnthropicClaudeSonnet46).toBe('anthropic/claude-sonnet-4.6')
    expect(Models.OpenAIGPT53Codex).toBe('openai/gpt-5.3-codex')
    expect(Models.XaiGrok41Reasoning).toBe('xai/grok-4.1-fast-reasoning')
  })

  it('sets the default model', () => {
    expect(DEFAULT_MODEL).toBe(Models.AnthropicClaudeOpus46)
  })

  it('includes all models in SUPPORTED_MODELS', () => {
    expect(SUPPORTED_MODELS).toContain(Models.AnthropicClaudeOpus46)
    expect(SUPPORTED_MODELS).toContain(Models.AnthropicClaudeSonnet46)
    expect(SUPPORTED_MODELS).toContain(Models.OpenAIGPT53Codex)
    expect(SUPPORTED_MODELS).toContain(Models.XaiGrok41Reasoning)
    expect(SUPPORTED_MODELS).toHaveLength(4)
  })

  it('maps every supported model to a display name', () => {
    for (const model of SUPPORTED_MODELS) {
      expect(MODEL_NAMES[model]).toBeDefined()
      expect(typeof MODEL_NAMES[model]).toBe('string')
    }
  })

  it('has at least one test prompt', () => {
    expect(TEST_PROMPTS.length).toBeGreaterThan(0)
    for (const prompt of TEST_PROMPTS) {
      expect(typeof prompt).toBe('string')
    }
  })
})
