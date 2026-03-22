import type { GitRemoteOriginInfo } from '../../types/electron'

interface Props {
  remoteInfo: GitRemoteOriginInfo
}

export function GitRemoteBar({ remoteInfo }: Props) {
  return (
    <div className="git-panel__remote" title={remoteInfo.raw}>
      <button
        type="button"
        className="git-panel__remote-link"
        onClick={() => void window.electronAPI.shell.openExternal(remoteInfo.repoUrl)}
      >
        Repository
      </button>
      <button
        type="button"
        className="git-panel__remote-link"
        onClick={() => void window.electronAPI.shell.openExternal(remoteInfo.issuesUrl)}
      >
        Issues
      </button>
      <button
        type="button"
        className="git-panel__remote-link"
        onClick={() => void window.electronAPI.shell.openExternal(remoteInfo.pullsUrl)}
      >
        {remoteInfo.pullsLabel}
      </button>
    </div>
  )
}
