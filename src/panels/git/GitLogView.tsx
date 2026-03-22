export interface LogEntry {
  hash: string
  date: string
  message: string
  author_name: string
}

function GitLogEntry({ entry }: { entry: LogEntry }) {
  return (
    <div className="git-panel__log-entry">
      <div className="git-panel__log-header">
        <span className="git-panel__log-hash">{entry.hash}</span>
        <span className="git-panel__log-date">
          {entry.date ? new Date(entry.date).toLocaleDateString() : ''}
        </span>
      </div>
      <div className="git-panel__log-message">{entry.message}</div>
      <div className="git-panel__log-author">{entry.author_name}</div>
    </div>
  )
}

interface Props {
  log: LogEntry[]
}

export function GitLogView({ log }: Props) {
  return (
    <div className="git-panel__log">
      {log.length === 0 ? (
        <div className="git-panel__empty">No commits yet</div>
      ) : (
        log.map((entry, i) => <GitLogEntry key={`${entry.hash}-${i}`} entry={entry} />)
      )}
    </div>
  )
}
