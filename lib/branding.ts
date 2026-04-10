/** Branding configuration that can be customised by admins. */
export interface BrandingConfig {
  /** Primary brand colour (hex). Applied to buttons, links, and accents. */
  primaryColor: string
  /** Secondary brand colour (hex). Applied to secondary UI surfaces. */
  secondaryColor: string
  /** URL for company logo (empty string means use default platform logo). */
  logoUrl: string
  /** Custom font family (empty string means use platform default). */
  fontFamily: string
}

/** Platform defaults used when no custom branding is applied. */
export const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#4F46E5',
  secondaryColor: '#F1F5F9',
  logoUrl: '',
  fontFamily: '',
}

/** LocalStorage key used to persist branding across sessions. */
export const BRANDING_STORAGE_KEY = 'platform-branding'

/** Read persisted branding from localStorage (returns null when absent). */
export function loadBranding(): BrandingConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as BrandingConfig
  } catch {
    return null
  }
}

/** Persist branding to localStorage. */
export function saveBranding(config: BrandingConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(config))
}

/** Remove persisted branding from localStorage. */
export function clearBranding(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(BRANDING_STORAGE_KEY)
}
