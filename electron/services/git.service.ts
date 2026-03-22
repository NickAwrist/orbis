import simpleGit, { SimpleGit } from 'simple-git'
import fs from 'fs/promises'
import path from 'path'
import { parseGitRemoteToWebInfo, type GitRemoteWebInfo } from '../utils/git-remote-origin'

export interface GitStatusResult {
  isRepo: boolean
  current: string | null
  tracking: string | null
  created: string[]
  staged: string[]
  modified: string[]
  deleted: string[]
  renamed: { from: string; to: string }[]
  not_added: string[]
  conflicted: string[]
  ahead: number
  behind: number
}

export interface GitLogEntry {
  hash: string
  date: string
  message: string
  author_name: string
  author_email: string
}

export interface GitRemoteOriginInfo extends GitRemoteWebInfo {
  raw: string
}

export class GitService {
  private getGit(cwd: string): SimpleGit {
    return simpleGit(cwd)
  }

  private normalizeCwd(cwd: string): string {
    const n = path.normalize(cwd.trim())
    return n.replace(/[/\\]+$/, '') || n
  }

  /** Directory containing the `.git` dir (works when workspace is a subfolder of the repo). */
  private async resolveGitRoot(cwd: string): Promise<string | null> {
    try {
      const top = String(await this.getGit(cwd).raw(['rev-parse', '--show-toplevel'])).trim()
      return top ? this.normalizeCwd(top) : null
    } catch {
      return null
    }
  }

  async isGitRepo(cwd: string): Promise<boolean> {
    try {
      const git = this.getGit(cwd)
      await git.revparse(['--git-dir'])
      return true
    } catch {
      return false
    }
  }

  async init(cwd: string): Promise<void> {
    await this.getGit(cwd).init()
  }

  async status(cwd: string): Promise<GitStatusResult> {
    const isRepo = await this.isGitRepo(cwd)
    if (!isRepo) {
      return {
        isRepo: false,
        current: null,
        tracking: null,
        created: [],
        staged: [],
        modified: [],
        deleted: [],
        renamed: [],
        not_added: [],
        conflicted: [],
        ahead: 0,
        behind: 0,
      }
    }

    try {
      const s = await this.getGit(cwd).status()
      return {
        isRepo: true,
        current: s.current,
        tracking: s.tracking,
        created: [...s.created],
        staged: [...s.staged],
        modified: [...s.modified],
        deleted: [...s.deleted],
        renamed: s.renamed.map((r) => ({ from: r.from, to: r.to })),
        not_added: [...s.not_added],
        conflicted: [...s.conflicted],
        ahead: s.ahead,
        behind: s.behind,
      }
    } catch (err: any) {
      return {
        isRepo: true,
        current: null,
        tracking: null,
        created: [],
        staged: [],
        modified: [],
        deleted: [],
        renamed: [],
        not_added: [],
        conflicted: [],
        ahead: 0,
        behind: 0,
      }
    }
  }

  async stage(cwd: string, files: string[]): Promise<void> {
    await this.getGit(cwd).add(files)
  }

  async unstage(cwd: string, files: string[]): Promise<void> {
    try {
      await this.getGit(cwd).reset(['HEAD', '--', ...files])
    } catch {
      await this.getGit(cwd).reset(['--', ...files])
    }
  }

  async commit(cwd: string, message: string): Promise<{ hash: string; summary: string }> {
    const result = await this.getGit(cwd).commit(message)
    return {
      hash: result.commit || '',
      summary: `${result.summary.changes} changes, ${result.summary.insertions} insertions, ${result.summary.deletions} deletions`,
    }
  }

  async log(cwd: string, maxCount = 20): Promise<{ entries: GitLogEntry[]; total: number }> {
    try {
      const isRepo = await this.isGitRepo(cwd)
      if (!isRepo) return { entries: [], total: 0 }

      const result = await this.getGit(cwd).log({ maxCount })
      const entries: GitLogEntry[] = (result.all || []).map((e) => ({
        hash: e.hash || '',
        date: e.date || '',
        message: e.message || '',
        author_name: e.author_name || '',
        author_email: e.author_email || '',
      }))
      return { entries, total: result.total }
    } catch {
      return { entries: [], total: 0 }
    }
  }

  async diff(cwd: string, file?: string): Promise<string> {
    try {
      const args = file ? [file] : []
      return await this.getGit(cwd).diff(args)
    } catch {
      return ''
    }
  }

  async getRemoteOriginInfo(cwd: string): Promise<GitRemoteOriginInfo | null> {
    const rootPath = this.normalizeCwd(cwd)
    const isRepo = await this.isGitRepo(rootPath)
    if (!isRepo) return null

    const gitRoot = (await this.resolveGitRoot(rootPath)) || rootPath
    const git = this.getGit(gitRoot)

    const tryUrl = async (name: string): Promise<string | null> => {
      try {
        const u = String(await git.raw(['remote', 'get-url', name])).trim()
        return u || null
      } catch {
        return null
      }
    }

    let raw: string | null = await tryUrl('origin')
    if (!raw) {
      try {
        const list = String(await git.raw(['remote'])).trim()
        const names = list.split(/\s+/).filter(Boolean)
        for (const name of names) {
          raw = await tryUrl(name)
          if (raw) break
        }
      } catch {
        return null
      }
    }

    if (!raw) return null
    const parsed = parseGitRemoteToWebInfo(raw)
    if (!parsed) return null
    return { raw, ...parsed }
  }
}
