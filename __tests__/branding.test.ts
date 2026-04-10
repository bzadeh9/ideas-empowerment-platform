import { describe, it, expect, beforeEach } from 'vitest'
import {
  DEFAULT_BRANDING,
  loadBranding,
  saveBranding,
  clearBranding,
  BRANDING_STORAGE_KEY,
  type BrandingConfig,
} from '@/lib/branding'

describe('branding config', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('DEFAULT_BRANDING has expected primary colour', () => {
    expect(DEFAULT_BRANDING.primaryColor).toBe('#4F46E5')
  })

  it('DEFAULT_BRANDING has expected secondary colour', () => {
    expect(DEFAULT_BRANDING.secondaryColor).toBe('#F1F5F9')
  })

  it('DEFAULT_BRANDING has empty logoUrl', () => {
    expect(DEFAULT_BRANDING.logoUrl).toBe('')
  })

  it('DEFAULT_BRANDING has empty fontFamily', () => {
    expect(DEFAULT_BRANDING.fontFamily).toBe('')
  })
})

describe('saveBranding / loadBranding', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing is stored', () => {
    expect(loadBranding()).toBeNull()
  })

  it('round-trips a config through localStorage', () => {
    const config: BrandingConfig = {
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      logoUrl: 'https://example.com/logo.png',
      fontFamily: 'Inter',
    }
    saveBranding(config)
    expect(loadBranding()).toEqual(config)
  })

  it('returns null for corrupt JSON', () => {
    localStorage.setItem(BRANDING_STORAGE_KEY, 'not-json')
    expect(loadBranding()).toBeNull()
  })
})

describe('clearBranding', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('removes stored branding', () => {
    saveBranding(DEFAULT_BRANDING)
    expect(loadBranding()).not.toBeNull()
    clearBranding()
    expect(loadBranding()).toBeNull()
  })
})
