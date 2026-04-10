import { describe, it, expect, vi } from 'vitest'

// Mock the gateway provider before importing
vi.mock('@ai-sdk/gateway', () => ({
  createGatewayProvider: () => {
    return (modelId: string) => ({ modelId, type: 'mock-model' })
  },
}))

import { getModelOptions } from '@/ai/gateway'
import { Models } from '@/ai/constants'

describe('getModelOptions', () => {
  it('returns OpenAI-specific options for GPT model', () => {
    const result = getModelOptions(Models.OpenAIGPT53Codex)
    expect(result.model).toBeDefined()
    expect(result.providerOptions?.openai).toBeDefined()
    expect(result.providerOptions?.openai).toMatchObject({
      include: ['reasoning.encrypted_content'],
      reasoningEffort: 'low',
      reasoningSummary: 'auto',
      serviceTier: 'priority',
    })
  })

  it('uses custom reasoning effort for OpenAI model', () => {
    const result = getModelOptions(Models.OpenAIGPT53Codex, {
      reasoningEffort: 'high',
    })
    expect(result.providerOptions?.openai).toMatchObject({
      reasoningEffort: 'high',
    })
  })

  it('returns Anthropic-specific options for Claude Sonnet', () => {
    const result = getModelOptions(Models.AnthropicClaudeSonnet46)
    expect(result.model).toBeDefined()
    expect(result.headers).toEqual({
      'anthropic-beta': 'fine-grained-tool-streaming-2025-05-14',
    })
    expect(result.providerOptions?.anthropic).toEqual({
      cacheControl: { type: 'ephemeral' },
    })
  })

  it('returns Anthropic-specific options for Claude Opus', () => {
    const result = getModelOptions(Models.AnthropicClaudeOpus46)
    expect(result.model).toBeDefined()
    expect(result.headers).toEqual({
      'anthropic-beta': 'fine-grained-tool-streaming-2025-05-14',
    })
    expect(result.providerOptions?.anthropic).toEqual({
      cacheControl: { type: 'ephemeral' },
    })
  })

  it('returns base options for unknown model IDs', () => {
    const result = getModelOptions('some-other/model')
    expect(result.model).toBeDefined()
    expect(result.providerOptions).toBeUndefined()
    expect(result.headers).toBeUndefined()
  })

  it('returns base options for Grok model', () => {
    const result = getModelOptions(Models.XaiGrok41Reasoning)
    expect(result.model).toBeDefined()
    expect(result.providerOptions).toBeUndefined()
    expect(result.headers).toBeUndefined()
  })
})
