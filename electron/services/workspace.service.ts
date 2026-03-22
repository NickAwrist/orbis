import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'

export interface WorkspaceSession {
  openWorkspaceIds: string[]
  activeWorkspaceId: string | null
}

export interface WorkspaceSummary {
  id: string
  name: string
  rootPath: string
}

export class WorkspaceService {
  private get dir(): string {
    return path.join(app.getPath('userData'), 'workspaces')
  }

  private get sessionPath(): string {
    return path.join(app.getPath('userData'), 'ide-session.json')
  }

  private async ensureDir() {
    await fs.mkdir(this.dir, { recursive: true })
  }

  /** Load session; migrate from legacy (all workspace JSONs open) if no session file yet. */
  async loadSession(): Promise<WorkspaceSession | null> {
    try {
      const raw = await fs.readFile(this.sessionPath, 'utf-8')
      const parsed = JSON.parse(raw) as WorkspaceSession
      if (
        Array.isArray(parsed.openWorkspaceIds) &&
        (parsed.activeWorkspaceId === null || typeof parsed.activeWorkspaceId === 'string')
      ) {
        return parsed
      }
    } catch {
      // missing or corrupt
    }

    const all = await this.loadAll()
    if (all.length === 0) return null

    const session: WorkspaceSession = {
      openWorkspaceIds: all.map((w: { id: string }) => w.id),
      activeWorkspaceId: all[0]?.id ?? null,
    }
    await this.saveSession(session)
    return session
  }

  async saveSession(session: WorkspaceSession): Promise<void> {
    await fs.writeFile(
      this.sessionPath,
      JSON.stringify(session, null, 2),
      'utf-8',
    )
  }

  async loadById(id: string): Promise<any | null> {
    await this.ensureDir()
    try {
      const raw = await fs.readFile(path.join(this.dir, `${id}.json`), 'utf-8')
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  async listSummaries(): Promise<WorkspaceSummary[]> {
    await this.ensureDir()
    const files = await fs.readdir(this.dir)
    const out: WorkspaceSummary[] = []
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      try {
        const raw = await fs.readFile(path.join(this.dir, file), 'utf-8')
        const w = JSON.parse(raw) as { id?: string; name?: string; rootPath?: string }
        if (w.id && typeof w.name === 'string' && typeof w.rootPath === 'string') {
          out.push({ id: w.id, name: w.name, rootPath: w.rootPath })
        }
      } catch {
        // skip
      }
    }
    return out
  }

  async loadAll(): Promise<any[]> {
    await this.ensureDir()
    const files = await fs.readdir(this.dir)
    const workspaces: any[] = []
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      try {
        const raw = await fs.readFile(path.join(this.dir, file), 'utf-8')
        workspaces.push(JSON.parse(raw))
      } catch {
        // skip corrupt files
      }
    }
    return workspaces
  }

  async save(data: { id: string; [key: string]: any }): Promise<void> {
    await this.ensureDir()
    const filePath = path.join(this.dir, `${data.id}.json`)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  async delete(id: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.dir, `${id}.json`))
    } catch {
      // file may not exist
    }
  }
}
