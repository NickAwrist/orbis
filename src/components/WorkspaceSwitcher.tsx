import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { useIDEStore } from '../stores/workspace.store'
import { WorkspaceManagerModal } from './WorkspaceManagerModal'

export function WorkspaceSwitcher() {
  const workspaces = useIDEStore((s) => s.workspaces)
  const activeId = useIDEStore((s) => s.activeWorkspaceId)
  const setActive = useIDEStore((s) => s.setActiveWorkspace)
  const closeWorkspace = useIDEStore((s) => s.closeWorkspace)
  const deleteWorkspacePermanently = useIDEStore((s) => s.deleteWorkspacePermanently)
  const [modalOpen, setModalOpen] = useState(false)

  const handleTabContextMenu = useCallback(
    (e: MouseEvent, id: string) => {
      e.preventDefault()
      if (
        window.confirm(
          'Delete this workspace permanently? Saved layout on disk will be removed.',
        )
      ) {
        void deleteWorkspacePermanently(id)
      }
    },
    [deleteWorkspacePermanently],
  )

  // Ctrl+1..9 to switch workspaces, Ctrl+Tab to cycle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9 && num <= workspaces.length) {
          e.preventDefault()
          setActive(workspaces[num - 1].id)
          return
        }
        if (e.key === 'Tab' && workspaces.length > 1) {
          e.preventDefault()
          const idx = workspaces.findIndex((w) => w.id === activeId)
          const next = (idx + 1) % workspaces.length
          setActive(workspaces[next].id)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [workspaces, activeId, setActive])

  return (
    <div className="workspace-switcher">
      <WorkspaceManagerModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <div className="workspace-switcher__tabs">
        {workspaces.map((ws, idx) => (
          <div
            key={ws.id}
            className={`workspace-switcher__tab ${ws.id === activeId ? 'workspace-switcher__tab--active' : ''}`}
            onClick={() => setActive(ws.id)}
            onContextMenu={(e) => handleTabContextMenu(e, ws.id)}
            title={`${ws.rootPath}\nRight-click: delete permanently`}
          >
            <span className="workspace-switcher__tab-index">{idx + 1}</span>
            <span className="workspace-switcher__tab-name">{ws.name}</span>
            <button
              className="workspace-switcher__tab-close"
              onClick={(e) => {
                e.stopPropagation()
                void closeWorkspace(ws.id)
              }}
              title="Close workspace (keeps saved state)"
            >
              ×
            </button>
          </div>
        ))}
        <button
          className="workspace-switcher__add"
          onClick={() => setModalOpen(true)}
          title="New or open workspace"
        >
          +
        </button>
      </div>
    </div>
  )
}
