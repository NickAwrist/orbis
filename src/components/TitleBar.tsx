import { AddComponentMenu } from './AddComponentMenu'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

interface Props {
  showAddComponentMenu: boolean
}

export function TitleBar({ showAddComponentMenu }: Props) {
  return (
    <div className="titlebar">
      <div className="titlebar__drag-region" />
      <div className="titlebar__left">
        <span className="titlebar__brand">Dynamic IDE</span>
      </div>
      <div className="titlebar__center">
        <WorkspaceSwitcher />
      </div>
      <div className="titlebar__right">
        {showAddComponentMenu && <AddComponentMenu />}
        <div className="titlebar__controls">
          <button type="button" className="titlebar__btn" onClick={() => window.electronAPI.window.minimize()}>
            ─
          </button>
          <button type="button" className="titlebar__btn" onClick={() => window.electronAPI.window.maximize()}>
            □
          </button>
          <button type="button" className="titlebar__btn titlebar__btn--close" onClick={() => window.electronAPI.window.close()}>
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
