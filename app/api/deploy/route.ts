import { Sandbox } from '@vercel/sandbox'
import JSZip from 'jszip'
import { NextResponse } from 'next/server'

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export async function POST(request: Request) {
  try {
    const { sandboxId } = await request.json()

    if (!sandboxId || typeof sandboxId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid sandboxId' },
        { status: 400 }
      )
    }

    const sandbox = await Sandbox.get({ sandboxId })
    const zip = new JSZip()

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

    for (const filePath of filePaths) {
      try {
        const stream = await sandbox.readFile({ path: filePath })
        if (stream) {
          const content = await streamToBuffer(stream)
          // Normalize path: remove leading ./
          const zipPath = filePath.startsWith('./')
            ? filePath.slice(2)
            : filePath
          zip.file(zipPath, content)
        }
      } catch {
        // Skip files that cannot be read
      }
    }

    const buffer = await zip.generateAsync({ type: 'arraybuffer' })

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="project.zip"',
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
