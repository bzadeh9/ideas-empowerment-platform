'use client'

import type { ChatUIMessage } from '@/components/chat/types'
import { TEST_PROMPTS } from '@/ai/constants'
import {
  MessageCircleIcon,
  SendIcon,
  WandSparklesIcon,
  SparklesIcon,
  LayoutGridIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { IdeaWizard } from '@/components/idea-wizard/idea-wizard'
import { Message } from '@/components/chat/message'
import { ModelSelector } from '@/components/settings/model-selector'
import { Panel, PanelHeader } from '@/components/panels/panels'
import { Settings } from '@/components/settings/settings'
import { TemplateGallery } from '@/components/templates/template-gallery'
import { useChat } from '@ai-sdk/react'
import { useLocalStorageValue } from '@/lib/use-local-storage-value'
import { useCallback, useEffect, useState } from 'react'
import { useSharedChatContext } from '@/lib/chat-context'
import { useSettings } from '@/components/settings/use-settings'
import { useSandboxStore } from './state'
import { composePrompt } from '@/lib/prompt-composer'

interface Props {
  className: string
  modelId?: string
}

export function Chat({ className }: Props) {
  const [input, setInput] = useLocalStorageValue('prompt-input')
  const { chat } = useSharedChatContext()
  const { modelId, reasoningEffort } = useSettings()
  const { messages, sendMessage, status } = useChat<ChatUIMessage>({ chat })
  const { setChatStatus } = useSandboxStore()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [refineOpen, setRefineOpen] = useState(false)
  const [refineText, setRefineText] = useState('')

  const validateAndSubmitMessage = useCallback(
    (text: string) => {
      if (text.trim()) {
        sendMessage({ text }, { body: { modelId, reasoningEffort } })
        setInput('')
      }
    },
    [sendMessage, modelId, setInput, reasoningEffort]
  )

  useEffect(() => {
    setChatStatus(status)
  }, [status, setChatStatus])

  const handleWizardGenerate = useCallback(
    (prompt: string) => {
      validateAndSubmitMessage(prompt)
    },
    [validateAndSubmitMessage]
  )

  const handleUseTemplate = useCallback(
    (prompt: string) => {
      setGalleryOpen(false)
      validateAndSubmitMessage(prompt)
    },
    [validateAndSubmitMessage]
  )

  const handleRefine = useCallback(() => {
    if (refineText.trim()) {
      const prompt = composePrompt({ problemStatement: refineText })
      validateAndSubmitMessage(prompt)
      setRefineOpen(false)
      setRefineText('')
    }
  }, [refineText, validateAndSubmitMessage])

  return (
    <Panel className={className}>
      <PanelHeader>
        <div className="flex items-center font-mono font-semibold uppercase">
          <MessageCircleIcon className="mr-2 w-4" />
          Chat
        </div>
        <div className="ml-auto font-mono text-xs opacity-50">[{status}]</div>
      </PanelHeader>

      {/* Messages Area */}
      {messages.length === 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col justify-center items-center h-full font-mono text-sm text-muted-foreground p-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setWizardOpen(true)}
              >
                <WandSparklesIcon className="w-4 h-4 mr-1" />
                Idea Wizard
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setGalleryOpen(true)}
              >
                <LayoutGridIcon className="w-4 h-4 mr-1" />
                Templates
              </Button>
            </div>
            <p className="flex items-center font-semibold">
              Click and try one of these prompts:
            </p>
            <ul className="p-4 space-y-1 text-center">
              {TEST_PROMPTS.map((template) => (
                <li
                  key={template.id}
                  className="px-4 py-2 rounded-sm border border-dashed shadow-sm cursor-pointer border-border hover:bg-secondary/50 hover:text-primary"
                  onClick={() => validateAndSubmitMessage(template.prompt)}
                >
                  <span className="font-medium">{template.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({template.category})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <Conversation className="relative w-full">
          <ConversationContent className="space-y-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      )}

      <form
        className="flex items-center p-2 space-x-1 border-t border-primary/18 bg-background"
        onSubmit={async (event) => {
          event.preventDefault()
          validateAndSubmitMessage(input)
        }}
      >
        <Settings />
        <ModelSelector />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-pointer shrink-0"
          title="Refine Idea"
          onClick={() => setRefineOpen(true)}
        >
          <SparklesIcon className="w-4 h-4" />
        </Button>
        <Input
          className="w-full font-mono text-sm rounded-sm border-0 bg-background"
          disabled={status === 'streaming' || status === 'submitted'}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          value={input}
        />
        <Button type="submit" disabled={status !== 'ready' || !input.trim()}>
          <SendIcon className="w-4 h-4" />
        </Button>
      </form>

      {/* Idea Wizard Dialog */}
      <IdeaWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onGenerate={handleWizardGenerate}
      />

      {/* Template Gallery Dialog */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Gallery</DialogTitle>
            <DialogDescription>
              Choose a template to get started quickly.
            </DialogDescription>
          </DialogHeader>
          <TemplateGallery onUseTemplate={handleUseTemplate} />
        </DialogContent>
      </Dialog>

      {/* Refine Idea Dialog */}
      <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>✨ Refine Idea</DialogTitle>
            <DialogDescription>
              Adjust your idea description and re-run the prompt composer.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            className="min-h-[100px]"
            placeholder="Describe your idea..."
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRefineOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRefine}
              disabled={!refineText.trim()}
            >
              Refine & Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  )
}
