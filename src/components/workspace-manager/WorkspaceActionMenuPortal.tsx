import type { RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { WorkspaceState } from '../../stores/workspace.store'

interface Summary {
  id: string
  name: string
  rootPath: string
}

interface Props {
  menuOpenId: string | null
  renamingId: string | null
  menuPos: { top: number; left: number }
  menuPopoverRef: RefObject<HTMLDivElement | null>
  openWs: WorkspaceState | undefined
  closedWs: Summary | undefined
  onStartRename: (id: string, currentName: string) => void
  onDelete: (id: string) => void
}

export function WorkspaceActionMenuPortal({
  menuOpenId,
  renamingId,
  menuPos,
  menuPopoverRef,
  openWs,
  closedWs,
  onStartRename,
  onDelete,
}: Props) {
  if (
    !menuOpenId ||
    renamingId ||
    !(openWs || closedWs)
  ) {
    return null
  }

  return createPortal(
    <div
      ref={menuPopoverRef as RefObject<HTMLDivElement>}
      className="workspace-modal__menu workspace-modal__menu-popover"
      style={{ top: menuPos.top, left: menuPos.left }}
      role="menu"
      onMouseDown={(e) => e.preventDefault()}
    >
      {openWs && (
        <>
          <button
            type="button"
            className="workspace-modal__menu-item"
            role="menuitem"
            onClick={() => onStartRename(openWs.id, openWs.name)}
          >
            Rename…
          </button>
          <button
            type="button"
            className="workspace-modal__menu-item workspace-modal__menu-item--danger"
            role="menuitem"
            onClick={() => void onDelete(openWs.id)}
          >
            Delete permanently…
          </button>
        </>
      )}
      {closedWs && !openWs && (
        <>
          <button
            type="button"
            className="workspace-modal__menu-item"
            role="menuitem"
            onClick={() => onStartRename(closedWs.id, closedWs.name)}
          >
            Rename…
          </button>
          <button
            type="button"
            className="workspace-modal__menu-item workspace-modal__menu-item--danger"
            role="menuitem"
            onClick={() => void onDelete(closedWs.id)}
          >
            Delete permanently…
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}
