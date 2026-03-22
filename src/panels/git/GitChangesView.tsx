import type { FileStatus } from './gitStatus'
import { GitCommitBox } from './GitCommitBox'
import { GitFileRow } from './GitFileRow'

interface Props {
  staged: FileStatus[]
  unstaged: FileStatus[]
  loading: boolean
  commitMsg: string
  error: string | null
  onCommitMsgChange: (v: string) => void
  onCommit: () => void
  onStageAll: () => void
  onUnstageAll: () => void
  onStageFiles: (paths: string[]) => void
  onUnstageFiles: (paths: string[]) => void
}

export function GitChangesView({
  staged,
  unstaged,
  loading,
  commitMsg,
  error,
  onCommitMsgChange,
  onCommit,
  onStageAll,
  onUnstageAll,
  onStageFiles,
  onUnstageFiles,
}: Props) {
  return (
    <div className="git-panel__changes">
      <div className="git-panel__section">
        <div className="git-panel__section-header">
          <span>Staged ({staged.length})</span>
          {staged.length > 0 && (
            <button type="button" className="git-panel__action" onClick={onUnstageAll}>
              Unstage All
            </button>
          )}
        </div>
        {staged.map((f) => (
          <GitFileRow
            key={`s-${f.path}`}
            file={f}
            actionTitle="Unstage"
            actionLabel="−"
            onAction={() => onUnstageFiles([f.path])}
          />
        ))}
      </div>

      <div className="git-panel__section">
        <div className="git-panel__section-header">
          <span>Changes ({unstaged.length})</span>
          {unstaged.length > 0 && (
            <button type="button" className="git-panel__action" onClick={onStageAll}>
              Stage All
            </button>
          )}
        </div>
        {unstaged.map((f) => (
          <GitFileRow
            key={`u-${f.path}`}
            file={f}
            actionTitle="Stage"
            actionLabel="+"
            onAction={() => onStageFiles([f.path])}
          />
        ))}
      </div>

      {staged.length === 0 && unstaged.length === 0 && !loading && (
        <div className="git-panel__clean">Working tree clean</div>
      )}

      <GitCommitBox
        commitMsg={commitMsg}
        stagedCount={staged.length}
        onCommitMsgChange={onCommitMsgChange}
        onCommit={onCommit}
      />

      {error && <div className="git-panel__error">{error}</div>}
    </div>
  )
}
