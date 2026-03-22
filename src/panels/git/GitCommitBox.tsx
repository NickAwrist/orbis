interface Props {
  commitMsg: string
  stagedCount: number
  onCommitMsgChange: (v: string) => void
  onCommit: () => void
}

export function GitCommitBox({ commitMsg, stagedCount, onCommitMsgChange, onCommit }: Props) {
  return (
    <div className="git-panel__commit">
      <textarea
        className="git-panel__commit-input"
        placeholder="Commit message..."
        value={commitMsg}
        onChange={(e) => onCommitMsgChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onCommit()
        }}
        rows={3}
      />
      <button
        type="button"
        className="git-panel__commit-btn"
        onClick={onCommit}
        disabled={!commitMsg.trim() || stagedCount === 0}
      >
        Commit ({stagedCount} file{stagedCount !== 1 ? 's' : ''})
      </button>
    </div>
  )
}
