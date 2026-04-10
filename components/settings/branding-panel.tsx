'use client'

import { useBranding } from '@/lib/branding-context'
import { meetsWcagAA } from '@/lib/contrast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { PaletteIcon } from 'lucide-react'
import { useState } from 'react'

export function BrandingPanel() {
  const { branding, updateBranding, resetBranding } = useBranding()

  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor)
  const [secondaryColor, setSecondaryColor] = useState(branding.secondaryColor)
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl)
  const [fontFamily, setFontFamily] = useState(branding.fontFamily)

  const contrastOk = meetsWcagAA(primaryColor, '#FFFFFF')

  function handleApply() {
    updateBranding({ primaryColor, secondaryColor, logoUrl, fontFamily })
  }

  function handleReset() {
    resetBranding()
    setPrimaryColor('#4F46E5')
    setSecondaryColor('#F1F5F9')
    setLogoUrl('')
    setFontFamily('')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Customize branding"
          className="cursor-pointer"
          size="icon"
          variant="outline"
        >
          <PaletteIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4 p-4" role="form" aria-label="Branding settings">
        <h3 className="text-sm font-semibold">Company Branding</h3>

        {/* Primary colour */}
        <div className="space-y-1">
          <Label htmlFor="branding-primary">Primary Color</Label>
          <div className="flex items-center space-x-2">
            <input
              aria-label="Primary color picker"
              className="h-8 w-8 cursor-pointer rounded border border-border"
              id="branding-primary"
              onChange={(e) => setPrimaryColor(e.target.value)}
              type="color"
              value={primaryColor}
            />
            <Input
              aria-label="Primary color hex"
              className="flex-1 font-mono text-xs"
              maxLength={7}
              onChange={(e) => setPrimaryColor(e.target.value)}
              value={primaryColor}
            />
          </div>
          {!contrastOk && (
            <p className="text-xs text-destructive" role="alert">
              Low contrast — may not meet WCAG AA
            </p>
          )}
        </div>

        {/* Secondary colour */}
        <div className="space-y-1">
          <Label htmlFor="branding-secondary">Secondary Color</Label>
          <div className="flex items-center space-x-2">
            <input
              aria-label="Secondary color picker"
              className="h-8 w-8 cursor-pointer rounded border border-border"
              id="branding-secondary"
              onChange={(e) => setSecondaryColor(e.target.value)}
              type="color"
              value={secondaryColor}
            />
            <Input
              aria-label="Secondary color hex"
              className="flex-1 font-mono text-xs"
              maxLength={7}
              onChange={(e) => setSecondaryColor(e.target.value)}
              value={secondaryColor}
            />
          </div>
        </div>

        {/* Logo URL */}
        <div className="space-y-1">
          <Label htmlFor="branding-logo">Logo URL</Label>
          <Input
            className="font-mono text-xs"
            id="branding-logo"
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.svg"
            value={logoUrl}
          />
        </div>

        {/* Font family */}
        <div className="space-y-1">
          <Label htmlFor="branding-font">Font Family</Label>
          <Input
            className="font-mono text-xs"
            id="branding-font"
            onChange={(e) => setFontFamily(e.target.value)}
            placeholder="Inter, Roboto, etc."
            value={fontFamily}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 pt-1">
          <Button onClick={handleReset} size="sm" variant="outline">
            Reset
          </Button>
          <Button onClick={handleApply} size="sm">
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
