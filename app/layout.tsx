import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { BrandingProvider } from '@/lib/branding-context'
import { ChatProvider } from '@/lib/chat-context'
import { CommandLogsStream } from '@/components/commands-logs/commands-logs-stream'
import { ErrorMonitor } from '@/components/error-monitor/error-monitor'
import { SandboxState } from '@/components/modals/sandbox-state'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'

const title = 'Ideas Empowerment Platform'
const description = `An end-to-end coding platform where users can enter text prompts and an AI agent will create full stack applications. Built with Next.js and the AI SDK.`

export const metadata: Metadata = {
  title,
  description,
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <BrandingProvider>
            <Suspense fallback={null}>
              <NuqsAdapter>
                <ChatProvider>
                  <ErrorMonitor>{children}</ErrorMonitor>
                </ChatProvider>
              </NuqsAdapter>
            </Suspense>
          </BrandingProvider>
          <Toaster />
          <CommandLogsStream />
          <SandboxState />
        </ThemeProvider>
      </body>
    </html>
  )
}
