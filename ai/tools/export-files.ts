import { Sandbox } from '@vercel/sandbox'
import { tool } from 'ai'
import z from 'zod/v3'

export interface FileEntry {
  path: string
  content: string
}

export interface FileBundle {
  files: FileEntry[]
  sandboxId: string
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf-8')
}

export const exportFiles = tool({
  description:
    'Export all files from a sandbox as a bundle. Use this tool when the user wants to download or export their generated project files.',
  inputSchema: z.object({
    sandboxId: z.string().describe('The sandbox ID to export files from'),
  }),
  execute: async ({ sandboxId }): Promise<string> => {
    const sandbox = await Sandbox.get({ sandboxId })

    // List all files, excluding node_modules and .next
    const cmd = await sandbox.runCommand({
      cmd: 'find',
      args: [
        '.',
        '-type',
        'f',
        '-not',
        '-path',
        '*/node_modules/*',
        '-not',
        '-path',
        '*/.next/*',
      ],
    })
    const done = await cmd.wait()
    const stdout = await done.stdout()
    const filePaths = stdout
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)

    const files: FileEntry[] = []

    for (const filePath of filePaths) {
      try {
        const stream = await sandbox.readFile({ path: filePath })
        if (stream) {
          const content = await streamToString(stream)
          files.push({ path: filePath, content })
        }
      } catch {
        // Skip unreadable files
      }
    }

    return `Exported ${files.length} files from sandbox ${sandboxId}. File paths: ${files.map((f) => f.path).join(', ')}`
  },
})
