import type { MouseEvent as ReactMouseEvent } from 'react'

interface Props {
  variant: 'open' | 'closed'
  name: string
  rootPath: string
  isRenaming: boolean
  renameDraft: string
  menuOpen: boolean
  isActiveWorkspace?: boolean
  mainTitle: string
  onRenameDraftChange: (v: string) => void
  onCommitRename: () => void
  onCancelRename: () => void
  onMainClick: () => void
  onToggleMenu: (e: ReactMouseEvent<HTMLButtonElement>) => void
}

export function WorkspaceListRow({
  variant,
  name,
  rootPath,
  isRenaming,
  renameDraft,
  menuOpen,
  isActiveWorkspace,
  mainTitle,
  onRenameDraftChange,
  onCommitRename,
  onCancelRename,
  onMainClick,
  onToggleMenu,
}: Props) {
  const rowActive =
    variant === 'open' && isActiveWorkspace ? ' workspace-modal__row--active' : ''

  return (
    <li className="workspace-modal__list-li">
      <div className={`workspace-modal__row${rowActive}`}>
        <button
          type="button"
          className="workspace-modal__row-main"
          onClick={onMainClick}
          title={mainTitle}
        >
          {isRenaming ? (
            <input
              className="workspace-modal__rename-input"
              value={renameDraft}
              onChange={(e) => onRenameDraftChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void onCommitRename()
                }
                if (e.key === 'Escape') onCancelRename()
              }}
              onBlur={() => void onCommitRename()}
              autoFocus
            />
          ) : variant === 'open' ? (
            <>
              <span className="workspace-modal__row-title">
                <span className="workspace-modal__list-name">{name}</span>
                {isActiveWorkspace && <span className="workspace-modal__badge">Active</span>}
              </span>
              <span className="workspace-modal__list-path" title={rootPath}>
                {rootPath}
              </span>
            </>
          ) : (
            <>
              <span className="workspace-modal__list-name">{name}</span>
              <span className="workspace-modal__list-path" title={rootPath}>
                {rootPath}
              </span>
            </>
          )}
        </button>
        <div className="workspace-modal__row-menu">
          <button
            type="button"
            className="workspace-modal__menu-trigger"
            aria-label="Workspace actions"
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
          >
            ⋯
          </button>
        </div>
      </div>
    </li>
  )
}
