import { describe, it, expect } from 'vitest'
import { dataPartSchema, errorSchema } from '@/ai/messages/data-parts'

describe('errorSchema', () => {
  it('validates a valid error object', () => {
    const result = errorSchema.safeParse({ message: 'Something went wrong' })
    expect(result.success).toBe(true)
  })

  it('rejects an error object without message', () => {
    const result = errorSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('dataPartSchema', () => {
  it('validates create-sandbox data', () => {
    const result = dataPartSchema.shape['create-sandbox'].safeParse({
      status: 'loading',
    })
    expect(result.success).toBe(true)
  })

  it('validates create-sandbox with sandboxId', () => {
    const result = dataPartSchema.shape['create-sandbox'].safeParse({
      sandboxId: 'sb-123',
      status: 'done',
    })
    expect(result.success).toBe(true)
  })

  it('rejects create-sandbox with invalid status', () => {
    const result = dataPartSchema.shape['create-sandbox'].safeParse({
      status: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('validates generating-files data', () => {
    const result = dataPartSchema.shape['generating-files'].safeParse({
      paths: ['src/index.ts'],
      status: 'generating',
    })
    expect(result.success).toBe(true)
  })

  it('validates run-command data', () => {
    const result = dataPartSchema.shape['run-command'].safeParse({
      sandboxId: 'sb-123',
      command: 'pnpm',
      args: ['install'],
      status: 'executing',
    })
    expect(result.success).toBe(true)
  })

  it('validates get-sandbox-url data', () => {
    const result = dataPartSchema.shape['get-sandbox-url'].safeParse({
      status: 'done',
      url: 'https://example.com',
    })
    expect(result.success).toBe(true)
  })

  it('validates report-errors data', () => {
    const result = dataPartSchema.shape['report-errors'].safeParse({
      summary: 'Build failed',
      paths: ['src/index.ts'],
    })
    expect(result.success).toBe(true)
  })

  it('validates report-errors without paths', () => {
    const result = dataPartSchema.shape['report-errors'].safeParse({
      summary: 'Build failed',
    })
    expect(result.success).toBe(true)
  })
})
