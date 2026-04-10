import { describe, it, expect } from 'vitest'
import { isRelativeUrl } from '@/lib/is-relative-url'

describe('isRelativeUrl', () => {
  it('returns true for relative paths', () => {
    expect(isRelativeUrl('/about')).toBe(true)
    expect(isRelativeUrl('about')).toBe(true)
    expect(isRelativeUrl('./page')).toBe(true)
    expect(isRelativeUrl('../page')).toBe(true)
  })

  it('returns false for absolute URLs', () => {
    expect(isRelativeUrl('https://example.com')).toBe(false)
    expect(isRelativeUrl('http://example.com/path')).toBe(false)
    expect(isRelativeUrl('ftp://files.example.com')).toBe(false)
  })

  it('returns true for fragment-only strings', () => {
    expect(isRelativeUrl('#section')).toBe(true)
  })

  it('returns true for query-only strings', () => {
    expect(isRelativeUrl('?q=test')).toBe(true)
  })

  it('returns true for empty string', () => {
    expect(isRelativeUrl('')).toBe(true)
  })
})
