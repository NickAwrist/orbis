import type { FileStatus } from './gitStatus'
import { gitStatusClass, gitStatusIcon } from './gitStatus'

interface Props {
  file: FileStatus
  actionTitle: string
  actionLabel: string
  onAction: () => void
}

export function GitFileRow({ file, actionTitle, actionLabel, onAction }: Props) {
  const icon = gitStatusIcon(file.index, file.working_dir)
  return (
    <div className="git-panel__file">
      <span className={`git-panel__file-status ${gitStatusClass(icon)}`}>{icon}</span>
      <span className="git-panel__file-path">{file.path}</span>
      <button type="button" className="git-panel__file-action" onClick={onAction} title={actionTitle}>
        {actionLabel}
      </button>
    </div>
  )
}
