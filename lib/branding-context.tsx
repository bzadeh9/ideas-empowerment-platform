'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  type BrandingConfig,
  DEFAULT_BRANDING,
  clearBranding,
  loadBranding,
  saveBranding,
} from '@/lib/branding'
import { hexToRgb, relativeLuminance } from '@/lib/contrast'

interface BrandingContextValue {
  branding: BrandingConfig
  updateBranding: (patch: Partial<BrandingConfig>) => void
  resetBranding: () => void
}

const BrandingContext = createContext<BrandingContextValue | undefined>(
  undefined
)

/** Apply branding CSS custom properties to the document root. */
function applyBrandingToDOM(config: BrandingConfig) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  // Primary colour
  const pr = hexToRgb(config.primaryColor)
  root.style.setProperty(
    '--primary',
    `rgb(${pr.r}, ${pr.g}, ${pr.b})`
  )

  // For foreground on primary, pick white or black for best contrast
  const lum = relativeLuminance(config.primaryColor)
  const fg = lum > 0.5 ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)'
  root.style.setProperty('--primary-foreground', fg)

  // Secondary colour
  const sr = hexToRgb(config.secondaryColor)
  root.style.setProperty(
    '--secondary',
    `rgb(${sr.r}, ${sr.g}, ${sr.b})`
  )

  // Ring / accent derived from primary
  root.style.setProperty(
    '--ring',
    `rgb(${pr.r}, ${pr.g}, ${pr.b})`
  )

  // Sidebar primary mirrors main primary
  root.style.setProperty(
    '--sidebar-primary',
    `rgb(${pr.r}, ${pr.g}, ${pr.b})`
  )
  root.style.setProperty('--sidebar-primary-foreground', fg)

  // Custom font
  if (config.fontFamily) {
    root.style.setProperty('--font-sans', `${config.fontFamily}, sans-serif`)
  } else {
    root.style.removeProperty('--font-sans')
  }
}

/** Remove all branding overrides from the document root. */
function removeBrandingFromDOM() {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const props = [
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--ring',
    '--sidebar-primary',
    '--sidebar-primary-foreground',
    '--font-sans',
  ]
  props.forEach((p) => root.style.removeProperty(p))
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING)

  // On mount, hydrate from localStorage
  useEffect(() => {
    const stored = loadBranding()
    if (stored) {
      setBranding(stored)
      applyBrandingToDOM(stored)
    }
  }, [])

  const updateBranding = useCallback(
    (patch: Partial<BrandingConfig>) => {
      const next = { ...branding, ...patch }
      setBranding(next)
      saveBranding(next)
      applyBrandingToDOM(next)
    },
    [branding]
  )

  const resetBranding = useCallback(() => {
    setBranding(DEFAULT_BRANDING)
    clearBranding()
    removeBrandingFromDOM()
  }, [])

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const ctx = useContext(BrandingContext)
  if (!ctx) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return ctx
}
