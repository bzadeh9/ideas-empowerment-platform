'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { InfoIcon } from 'lucide-react'
import { create } from 'zustand'
import { useEffect, useCallback } from 'react'

interface State {
  open: boolean | undefined
  setOpen: (open: boolean) => void
}

export const useWelcomeStore = create<State>((set) => ({
  open: undefined,
  setOpen: (open) => set({ open }),
}))

export function Welcome(props: {
  onDismissAction(): void
  defaultOpen: boolean
}) {
  const { open, setOpen } = useWelcomeStore()

  useEffect(() => {
    setOpen(props.defaultOpen)
  }, [setOpen, props.defaultOpen])

  const handleDismiss = useCallback(() => {
    props.onDismissAction()
    setOpen(false)
  }, [props, setOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss()
      }
    }

    const isOpen = typeof open === 'undefined' ? props.defaultOpen : open
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, props.defaultOpen, handleDismiss])

  if (!(typeof open === 'undefined' ? props.defaultOpen : open)) {
    return null
  }

  return (
    <div
      aria-label="Welcome dialog"
      aria-modal="true"
      className="fixed w-screen h-screen z-10"
      role="dialog"
    >
      <div className="absolute w-full h-full bg-secondary opacity-60" />
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={handleDismiss}
      >
        <div
          className="bg-background max-w-xl mx-4 rounded-lg shadow overflow-hidden"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="p-6 space-y-4 ">
            <h1 className="text-2xl sans-serif font-semibold tracking-tight mb-7">
              Ideas Empowerment Platform
            </h1>
            <p className="text-base text-primary">
              An <strong>end-to-end coding platform</strong> where users can
              enter text prompts and an AI agent will create full stack
              applications.
            </p>
            <p className="text-base text-secondary-foreground">
              Built with{' '}
              <ExternalLink href="https://nextjs.org/">Next.js</ExternalLink>{' '}
              and the{' '}
              <ExternalLink href="https://ai-sdk.dev/docs/introduction">
                AI SDK
              </ExternalLink>
              , this platform empowers you to bring your ideas to life through
              conversational AI-driven development.
            </p>
          </div>
          <footer className="bg-secondary flex justify-end p-4 border-t border-border">
            <Button className="cursor-pointer" onClick={handleDismiss}>
              Get started
            </Button>
          </footer>
        </div>
      </div>
    </div>
  )
}

export function ToggleWelcome() {
  const { open, setOpen } = useWelcomeStore()
  return (
    <Button
      className="cursor-pointer"
      onClick={() => setOpen(!open)}
      variant="outline"
      size="sm"
    >
      <InfoIcon /> <span className="hidden lg:inline">What&apos;s this?</span>
    </Button>
  )
}

function ExternalLink({
  children,
  href,
}: {
  children: ReactNode
  href: string
}) {
  return (
    <a
      className="underline underline-offset-3 text-primary"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  )
}
