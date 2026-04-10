'use client'

import { useBranding } from '@/lib/branding-context'
import { PlatformLogo } from '@/components/icons/platform-logo'

interface Props {
  className?: string
}

/**
 * Renders the company logo when a custom logoUrl is configured,
 * otherwise falls back to the default PlatformLogo icon.
 */
export function CompanyLogo({ className }: Props) {
  const { branding } = useBranding()

  if (branding.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt="Company logo"
        className={className}
        height={22}
        src={branding.logoUrl}
        width={22}
      />
    )
  }

  return <PlatformLogo className={className} />
}
