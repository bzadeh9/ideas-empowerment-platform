import { describe, it, expect } from 'vitest'
import type {
  Project,
  ProjectSummary,
  ProjectCreateInput,
  StoredMessage,
  FileEntry,
  SandboxConfig,
} from '@/lib/storage/types'

describe('storage types', () => {
  it('Project type can be serialized and deserialized via JSON', () => {
    const project: Project = {
      id: 'test-id',
      title: 'My Project',
      description: 'A great idea',
      chatHistory: [
        { id: '1', role: 'user', content: 'Build me an app' },
        { id: '2', role: 'assistant', content: 'Sure, here it is.' },
      ],
      fileManifest: [{ path: '/src/index.ts' }, { path: '/src/app.tsx' }],
      sandboxConfig: { sandboxId: 'sbx-123' },
      status: 'in-progress',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    }

    const json = JSON.stringify(project)
    const parsed: Project = JSON.parse(json)

    expect(parsed).toEqual(project)
    expect(parsed.chatHistory).toHaveLength(2)
    expect(parsed.fileManifest).toHaveLength(2)
    expect(parsed.sandboxConfig.sandboxId).toBe('sbx-123')
  })

  it('ProjectSummary excludes heavy fields', () => {
    const summary: ProjectSummary = {
      id: 'test-id',
      title: 'My Project',
      description: 'A great idea',
      status: 'draft',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    }

    const json = JSON.stringify(summary)
    const parsed = JSON.parse(json) as Record<string, unknown>

    expect(parsed).toEqual(summary)
    expect(parsed).not.toHaveProperty('chatHistory')
    expect(parsed).not.toHaveProperty('fileManifest')
    expect(parsed).not.toHaveProperty('sandboxConfig')
  })

  it('StoredMessage round-trips correctly', () => {
    const msg: StoredMessage = {
      id: 'msg-1',
      role: 'user',
      content: 'Hello world',
      createdAt: '2024-01-01T00:00:00.000Z',
    }

    expect(JSON.parse(JSON.stringify(msg))).toEqual(msg)
  })

  it('FileEntry round-trips correctly', () => {
    const entry: FileEntry = { path: '/src/main.ts' }
    expect(JSON.parse(JSON.stringify(entry))).toEqual(entry)
  })

  it('SandboxConfig round-trips correctly', () => {
    const config: SandboxConfig = { sandboxId: 'sbx-456' }
    expect(JSON.parse(JSON.stringify(config))).toEqual(config)
  })

  it('SandboxConfig allows undefined sandboxId', () => {
    const config: SandboxConfig = {}
    const parsed = JSON.parse(JSON.stringify(config)) as SandboxConfig
    expect(parsed.sandboxId).toBeUndefined()
  })

  it('ProjectCreateInput can be constructed without id, createdAt, updatedAt', () => {
    const input: ProjectCreateInput = {
      title: 'Test',
      description: 'test',
      chatHistory: [],
      fileManifest: [],
      sandboxConfig: {},
      status: 'draft',
    }

    const json = JSON.stringify(input)
    const parsed = JSON.parse(json) as Record<string, unknown>
    expect(parsed).not.toHaveProperty('id')
    expect(parsed).not.toHaveProperty('createdAt')
    expect(parsed).not.toHaveProperty('updatedAt')
  })
})
