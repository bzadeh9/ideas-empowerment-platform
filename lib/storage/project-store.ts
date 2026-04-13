import Dexie, { type EntityTable } from 'dexie'
import { nanoid } from 'nanoid'
import type {
  IProjectStore,
  Project,
  ProjectCreateInput,
  ProjectSummary,
} from './types'

/** Dexie database for the Ideas Empowerment Platform. */
class ProjectDatabase extends Dexie {
  projects!: EntityTable<Project, 'id'>

  constructor(dbName = 'ideas-empowerment-platform') {
    super(dbName)
    this.version(1).stores({
      projects: 'id, title, status, updatedAt',
    })
  }
}

/** IndexedDB-backed project store using Dexie. */
export class ProjectStore implements IProjectStore {
  private db: ProjectDatabase

  constructor(dbName?: string) {
    this.db = new ProjectDatabase(dbName)
  }

  async create(input: ProjectCreateInput): Promise<Project> {
    const now = new Date().toISOString()
    const project: Project = {
      ...input,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    }
    await this.db.projects.add(project)
    return project
  }

  async getAll(): Promise<ProjectSummary[]> {
    const projects = await this.db.projects
      .orderBy('updatedAt')
      .reverse()
      .toArray()
    return projects.map(
      ({ id, title, description, status, createdAt, updatedAt }) => ({
        id,
        title,
        description,
        status,
        createdAt,
        updatedAt,
      })
    )
  }

  async getById(id: string): Promise<Project | undefined> {
    return this.db.projects.get(id)
  }

  async update(id: string, patch: Partial<Project>): Promise<void> {
    await this.db.projects.update(id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.projects.delete(id)
  }
}

/** Singleton store instance for use in the app. */
let storeInstance: ProjectStore | undefined

export function getProjectStore(): ProjectStore {
  if (!storeInstance) {
    storeInstance = new ProjectStore()
  }
  return storeInstance
}
