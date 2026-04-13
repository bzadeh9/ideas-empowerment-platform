'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState } from 'react'

interface Instruction {
  provider: string
  steps: string[]
}

const instructions: Instruction[] = [
  {
    provider: 'AWS Amplify',
    steps: [
      'npm install -g @aws-amplify/cli',
      'amplify init',
      'amplify publish',
    ],
  },
  {
    provider: 'Google Cloud Run',
    steps: ['gcloud run deploy --source .'],
  },
  {
    provider: 'Azure Static Web Apps',
    steps: [
      'npm install -g @azure/static-web-apps-cli',
      'swa init',
      'swa deploy',
    ],
  },
]

export function DeployInstructions() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        After exporting your project as a ZIP, unzip the files and run the
        following commands to deploy to your preferred cloud provider.
      </p>
      {instructions.map((instruction) => (
        <div key={instruction.provider} className="space-y-2">
          <h4 className="text-sm font-semibold">{instruction.provider}</h4>
          {instruction.steps.map((step) => (
            <CodeBlock key={step} code={step} />
          ))}
        </div>
      ))}
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between bg-secondary rounded-sm px-3 py-2">
      <code className="text-xs font-mono">{code}</code>
      <button
        onClick={handleCopy}
        type="button"
        className="cursor-pointer ml-2 text-muted-foreground hover:text-foreground"
        aria-label={`Copy "${code}" to clipboard`}
      >
        {copied ? (
          <CheckIcon className="w-3.5 h-3.5" />
        ) : (
          <CopyIcon className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  )
}
