/** Represents a chat message stored as part of a project. */
export interface StoredMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: string
}

/** Represents a file entry in the project manifest. */
export interface FileEntry {
  path: string
}

/** Sandbox configuration snapshot. */
export interface SandboxConfig {
  sandboxId?: string
}

/** Full project entity persisted in storage. */
export interface Project {
  id: string
  title: string
  description: string
  chatHistory: StoredMessage[]
  fileManifest: FileEntry[]
  sandboxConfig: SandboxConfig
  status: 'draft' | 'in-progress' | 'complete'
  createdAt: string
  updatedAt: string
}

/** Lightweight summary used in project listings. */
export interface ProjectSummary {
  id: string
  title: string
  description: string
  status: 'draft' | 'in-progress' | 'complete'
  createdAt: string
  updatedAt: string
}

/** Input type for creating a new project (auto-generated fields are excluded). */
export type ProjectCreateInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>

/** Storage adapter interface — allows swapping IndexedDB for a server-side backend. */
export interface IProjectStore {
  create(input: ProjectCreateInput): Promise<Project>
  getAll(): Promise<ProjectSummary[]>
  getById(id: string): Promise<Project | undefined>
  update(id: string, patch: Partial<Project>): Promise<void>
  delete(id: string): Promise<void>
}
