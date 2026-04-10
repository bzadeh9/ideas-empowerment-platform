import { describe, it, expect } from 'vitest'
import { metadataSchema } from '@/ai/messages/metadata'

describe('metadataSchema', () => {
  it('validates a valid metadata object', () => {
    const result = metadataSchema.safeParse({
      model: 'anthropic/claude-opus-4.6',
    })
    expect(result.success).toBe(true)
  })

  it('rejects metadata without model field', () => {
    const result = metadataSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects metadata with non-string model', () => {
    const result = metadataSchema.safeParse({ model: 123 })
    expect(result.success).toBe(false)
  })
})
