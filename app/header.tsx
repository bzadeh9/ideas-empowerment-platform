'use client'

import { BrandingPanel } from '@/components/settings/branding-panel'
import { ToggleWelcome } from '@/components/modals/welcome'
import { CompanyLogo } from '@/components/icons/company-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export function Header({ className }: Props) {
  return (
    <header
      aria-label="Platform header"
      className={cn('flex items-center justify-between', className)}
      role="banner"
    >
      <div className="flex items-center">
        <CompanyLogo className="ml-1 md:ml-2.5 mr-1.5 text-primary" />
        <span className="hidden md:inline text-sm uppercase font-mono font-bold tracking-tight">
          Ideas Empowerment Platform
        </span>
      </div>
      <div className="flex items-center ml-auto space-x-1.5">
        <BrandingPanel />
        <ThemeToggle />
        <ToggleWelcome />
      </div>
    </header>
  )
}
