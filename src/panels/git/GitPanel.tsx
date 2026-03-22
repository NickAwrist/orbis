import { useCallback, useEffect, useState } from 'react'
import type { GitRemoteOriginInfo } from '../../types/electron'
import { PanelState, WorkspaceState } from '../../stores/workspace.store'
import type { FileStatus } from './gitStatus'
import { GitChangesView } from './GitChangesView'
import { GitLogView, type LogEntry } from './GitLogView'
import { GitRemoteBar } from './GitRemoteBar'

interface Props {
  panel: PanelState
  workspace: WorkspaceState
}

export function GitPanel({ panel: _panel, workspace }: Props) {
  const [isRepo, setIsRepo] = useState<boolean | null>(null)
  const [branch, setBranch] = useState<string | null>(null)
  const [staged, setStaged] = useState<FileStatus[]>([])
  const [unstaged, setUnstaged] = useState<FileStatus[]>([])
  const [commitMsg, setCommitMsg] = useState('')
  const [log, setLog] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [tab, setTab] = useState<'changes' | 'log'>('changes')
  const [remoteInfo, setRemoteInfo] = useState<GitRemoteOriginInfo | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const status = await window.electronAPI.git.status(workspace.rootPath)

      if (!status.isRepo) {
        setIsRepo(false)
        setStaged([])
        setUnstaged([])
        setBranch(null)
        setRemoteInfo(null)
        setLoading(false)
        return
      }

      setIsRepo(true)
      setBranch(status.current || 'HEAD')

      try {
        const remote = await window.electronAPI.git.getRemoteOriginInfo(workspace.rootPath)
        setRemoteInfo(remote)
      } catch {
        setRemoteInfo(null)
      }

      const stagedFiles: FileStatus[] = [
        ...(status.created || []).map((p: string) => ({ path: p, index: 'A', working_dir: ' ' })),
        ...(status.staged || []).map((p: string) => ({ path: p, index: 'M', working_dir: ' ' })),
        ...(status.deleted || []).map((p: string) => ({ path: p, index: 'D', working_dir: ' ' })),
        ...(status.renamed || []).map((r: { to: string }) => ({ path: r.to, index: 'R', working_dir: ' ' })),
      ]

      const unstagedFiles: FileStatus[] = [
        ...(status.modified || []).map((p: string) => ({ path: p, index: ' ', working_dir: 'M' })),
        ...(status.not_added || []).map((p: string) => ({ path: p, index: '?', working_dir: '?' })),
      ]

      const stagedPaths = new Set(stagedFiles.map((f) => f.path))
      const filteredUnstaged = unstagedFiles.filter((f) => !stagedPaths.has(f.path))

      setStaged(stagedFiles)
      setUnstaged(filteredUnstaged)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to get git status'
      setError(msg)
      setRemoteInfo(null)
    }
    setLoading(false)
  }, [workspace.rootPath])

  const refreshLog = useCallback(async () => {
    try {
      const result = await window.electronAPI.git.log(workspace.rootPath, 30)
      setLog(
        (result.entries || []).map((entry: Record<string, unknown>) => ({
          hash: (entry.hash as string)?.slice(0, 7) || '',
          date: (entry.date as string) || '',
          message: (entry.message as string) || '',
          author_name: (entry.author_name as string) || '',
        })),
      )
    } catch {
      setLog([])
    }
  }, [workspace.rootPath])

  useEffect(() => {
    refresh()
    refreshLog()
  }, [refresh, refreshLog])

  const handleInit = useCallback(async () => {
    setInitializing(true)
    try {
      await window.electronAPI.git.init(workspace.rootPath)
      await refresh()
      await refreshLog()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize git repository'
      setError(msg)
    }
    setInitializing(false)
  }, [workspace.rootPath, refresh, refreshLog])

  const stageFiles = useCallback(
    async (files: string[]) => {
      try {
        await window.electronAPI.git.stage(workspace.rootPath, files)
        await refresh()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Stage failed'
        setError(msg)
      }
    },
    [workspace.rootPath, refresh],
  )

  const unstageFiles = useCallback(
    async (files: string[]) => {
      try {
        await window.electronAPI.git.unstage(workspace.rootPath, files)
        await refresh()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unstage failed'
        setError(msg)
      }
    },
    [workspace.rootPath, refresh],
  )

  const commitChanges = useCallback(async () => {
    if (!commitMsg.trim()) return
    setError(null)
    try {
      await window.electronAPI.git.commit(workspace.rootPath, commitMsg)
      setCommitMsg('')
      await refresh()
      await refreshLog()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Commit failed'
      setError(msg)
    }
  }, [workspace.rootPath, commitMsg, refresh, refreshLog])

  const stageAll = useCallback(() => {
    const files = unstaged.map((f) => f.path)
    if (files.length > 0) void stageFiles(files)
  }, [unstaged, stageFiles])

  const unstageAll = useCallback(() => {
    const files = staged.map((f) => f.path)
    if (files.length > 0) void unstageFiles(files)
  }, [staged, unstageFiles])

  if (isRepo === false) {
    return (
      <div className="git-panel">
        <div className="git-panel__init">
          <div className="git-panel__init-icon">&#x2139;</div>
          <p className="git-panel__init-text">This folder is not a git repository.</p>
          <button type="button" className="git-panel__init-btn" onClick={handleInit} disabled={initializing}>
            {initializing ? 'Initializing...' : 'Initialize Git Repository'}
          </button>
          {error && <div className="git-panel__error">{error}</div>}
        </div>
      </div>
    )
  }

  if (isRepo === null) {
    return (
      <div className="git-panel">
        <div className="git-panel__loading">Checking repository...</div>
      </div>
    )
  }

  return (
    <div className="git-panel">
      <div className="git-panel__tab-bar">
        <button
          type="button"
          className={`git-panel__tab ${tab === 'changes' ? 'git-panel__tab--active' : ''}`}
          onClick={() => setTab('changes')}
        >
          Changes
        </button>
        <button
          type="button"
          className={`git-panel__tab ${tab === 'log' ? 'git-panel__tab--active' : ''}`}
          onClick={() => {
            setTab('log')
            void refreshLog()
          }}
        >
          Log
        </button>
        {branch && <span className="git-panel__branch">{branch}</span>}
        <button
          type="button"
          className="git-panel__refresh"
          onClick={() => {
            void refresh()
            void refreshLog()
          }}
          title="Refresh"
        >
          &#x21BB;
        </button>
      </div>

      {remoteInfo && <GitRemoteBar remoteInfo={remoteInfo} />}

      {tab === 'changes' && (
        <GitChangesView
          staged={staged}
          unstaged={unstaged}
          loading={loading}
          commitMsg={commitMsg}
          error={error}
          onCommitMsgChange={setCommitMsg}
          onCommit={commitChanges}
          onStageAll={stageAll}
          onUnstageAll={unstageAll}
          onStageFiles={stageFiles}
          onUnstageFiles={unstageFiles}
        />
      )}

      {tab === 'log' && <GitLogView log={log} />}
    </div>
  )
}
