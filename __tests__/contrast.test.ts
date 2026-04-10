import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  meetsWcagAA,
} from '@/lib/contrast'

describe('hexToRgb', () => {
  it('parses a 6-digit hex colour', () => {
    expect(hexToRgb('#4F46E5')).toEqual({ r: 79, g: 70, b: 229 })
  })

  it('parses a 3-digit shorthand hex colour', () => {
    expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('handles lowercase hex', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('handles missing hash prefix', () => {
    expect(hexToRgb('000000')).toEqual({ r: 0, g: 0, b: 0 })
  })
})

describe('relativeLuminance', () => {
  it('returns 1 for white', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 4)
  })

  it('returns 0 for black', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 4)
  })

  it('returns a mid-range value for a mid-tone colour', () => {
    const lum = relativeLuminance('#808080')
    expect(lum).toBeGreaterThan(0.15)
    expect(lum).toBeLessThan(0.25)
  })
})

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0)
  })

  it('returns 1 for same colours', () => {
    expect(contrastRatio('#4F46E5', '#4F46E5')).toBeCloseTo(1, 2)
  })

  it('is commutative', () => {
    const a = contrastRatio('#4F46E5', '#FFFFFF')
    const b = contrastRatio('#FFFFFF', '#4F46E5')
    expect(a).toBeCloseTo(b, 4)
  })
})

describe('meetsWcagAA', () => {
  it('returns true for black on white', () => {
    expect(meetsWcagAA('#000000', '#FFFFFF')).toBe(true)
  })

  it('returns false for two similar light colours', () => {
    expect(meetsWcagAA('#EEEEEE', '#FFFFFF')).toBe(false)
  })

  it('returns true for the default primary on white', () => {
    // #4F46E5 on white → ratio ≈ 5.6
    expect(meetsWcagAA('#4F46E5', '#FFFFFF')).toBe(true)
  })
})
