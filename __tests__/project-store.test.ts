import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { ProjectStore } from '@/lib/storage/project-store'
import type { ProjectCreateInput } from '@/lib/storage/types'

function makeInput(
  overrides: Partial<ProjectCreateInput> = {}
): ProjectCreateInput {
  return {
    title: 'Test Project',
    description: 'A test project description',
    chatHistory: [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there!' },
    ],
    fileManifest: [{ path: '/src/index.ts' }],
    sandboxConfig: { sandboxId: 'sandbox-123' },
    status: 'draft',
    ...overrides,
  }
}

let dbCounter = 0

function createTestStore(): ProjectStore {
  dbCounter++
  return new ProjectStore(`test-db-${dbCounter}-${Date.now()}`)
}

describe('ProjectStore', () => {
  let store: ProjectStore

  beforeEach(() => {
    store = createTestStore()
  })

  describe('create', () => {
    it('creates a project with auto-generated id and timestamps', async () => {
      const input = makeInput()
      const project = await store.create(input)

      expect(project.id).toBeDefined()
      expect(project.id.length).toBeGreaterThan(0)
      expect(project.title).toBe('Test Project')
      expect(project.description).toBe('A test project description')
      expect(project.chatHistory).toHaveLength(2)
      expect(project.fileManifest).toEqual([{ path: '/src/index.ts' }])
      expect(project.sandboxConfig).toEqual({ sandboxId: 'sandbox-123' })
      expect(project.status).toBe('draft')
      expect(project.createdAt).toBeDefined()
      expect(project.updatedAt).toBeDefined()
      expect(new Date(project.createdAt).getTime()).not.toBeNaN()
    })

    it('creates projects with unique IDs', async () => {
      const a = await store.create(makeInput({ title: 'A' }))
      const b = await store.create(makeInput({ title: 'B' }))
      expect(a.id).not.toBe(b.id)
    })
  })

  describe('getAll', () => {
    it('returns empty array when no projects exist', async () => {
      const all = await store.getAll()
      expect(all).toEqual([])
    })

    it('returns summaries sorted by updatedAt descending', async () => {
      await store.create(makeInput({ title: 'First' }))
      // Small delay to ensure different timestamps
      await new Promise((r) => setTimeout(r, 10))
      await store.create(makeInput({ title: 'Second' }))

      const all = await store.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].title).toBe('Second')
      expect(all[1].title).toBe('First')

      // Summaries should not include chatHistory or fileManifest
      const summary = all[0]
      expect(summary).toHaveProperty('id')
      expect(summary).toHaveProperty('title')
      expect(summary).toHaveProperty('description')
      expect(summary).toHaveProperty('status')
      expect(summary).toHaveProperty('createdAt')
      expect(summary).toHaveProperty('updatedAt')
      expect(summary).not.toHaveProperty('chatHistory')
      expect(summary).not.toHaveProperty('fileManifest')
    })
  })

  describe('getById', () => {
    it('returns the full project by ID', async () => {
      const created = await store.create(makeInput())
      const found = await store.getById(created.id)

      expect(found).toBeDefined()
      expect(found!.id).toBe(created.id)
      expect(found!.chatHistory).toHaveLength(2)
      expect(found!.fileManifest).toEqual([{ path: '/src/index.ts' }])
    })

    it('returns undefined for a non-existent ID', async () => {
      const found = await store.getById('non-existent')
      expect(found).toBeUndefined()
    })
  })

  describe('update', () => {
    it('updates a project with a partial patch', async () => {
      const project = await store.create(makeInput())
      await store.update(project.id, {
        title: 'Updated Title',
        status: 'in-progress',
      })

      const updated = await store.getById(project.id)
      expect(updated!.title).toBe('Updated Title')
      expect(updated!.status).toBe('in-progress')
      // Original fields should be preserved
      expect(updated!.description).toBe('A test project description')
    })

    it('updates the updatedAt timestamp', async () => {
      const project = await store.create(makeInput())
      await new Promise((r) => setTimeout(r, 10))
      await store.update(project.id, { title: 'Updated' })

      const updated = await store.getById(project.id)
      expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThan(
        new Date(project.updatedAt).getTime()
      )
    })
  })

  describe('delete', () => {
    it('removes a project from the store', async () => {
      const project = await store.create(makeInput())
      expect(await store.getById(project.id)).toBeDefined()

      await store.delete(project.id)
      expect(await store.getById(project.id)).toBeUndefined()
    })

    it('does not throw when deleting a non-existent ID', async () => {
      await expect(store.delete('non-existent')).resolves.not.toThrow()
    })
  })
})
