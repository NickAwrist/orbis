import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { useIDEStore } from '../stores/workspace.store'

interface Props {
  open: boolean
  onClose: () => void
}

const MENU_MIN_W = 180

function useWorkspaceMenuPosition(
  menuOpenId: string | null,
  triggerRef: RefObject<HTMLButtonElement | null>,
  menuRef: RefObject<HTMLDivElement | null>,
) {
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!menuOpenId || !triggerRef.current) return

    const update = () => {
      const trigger = triggerRef.current
      const menu = menuRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const mh = menu?.offsetHeight ?? 96
      const mw = Math.max(menu?.offsetWidth ?? MENU_MIN_W, MENU_MIN_W)
      const gap = 6
      let top = rect.bottom + gap
      if (top + mh > window.innerHeight - 8) {
        top = rect.top - mh - gap
      }
      top = Math.max(8, Math.min(top, window.innerHeight - mh - 8))
      let left = rect.right - mw
      left = Math.max(8, Math.min(left, window.innerWidth - mw - 8))
      setCoords({ top, left })
    }

    update()

    const ro = new ResizeObserver(() => update())
    const attachMenu = () => {
      if (menuRef.current) ro.observe(menuRef.current)
    }
    attachMenu()
    const raf = requestAnimationFrame(() => {
      update()
      attachMenu()
    })

    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [menuOpenId, triggerRef, menuRef])

  return coords
}

export function WorkspaceManagerModal({ open, onClose }: Props) {
  const workspaces = useIDEStore((s) => s.workspaces)
  const activeWorkspaceId = useIDEStore((s) => s.activeWorkspaceId)
  const addWorkspace = useIDEStore((s) => s.addWorkspace)
  const openWorkspace = useIDEStore((s) => s.openWorkspace)
  const setActiveWorkspace = useIDEStore((s) => s.setActiveWorkspace)
  const deleteWorkspacePermanently = useIDEStore((s) => s.deleteWorkspacePermanently)
  const renameWorkspace = useIDEStore((s) => s.renameWorkspace)

  const [newName, setNewName] = useState('')
  const [rootPath, setRootPath] = useState<string | null>(null)
  const [summaries, setSummaries] = useState<
    Array<{ id: string; name: string; rootPath: string }>
  >([])
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')

  const menuTriggerRef = useRef<HTMLButtonElement | null>(null)
  const menuPopoverRef = useRef<HTMLDivElement | null>(null)
  const menuPos = useWorkspaceMenuPosition(menuOpenId, menuTriggerRef, menuPopoverRef)

  const openIds = new Set(workspaces.map((w) => w.id))

  const refreshSummaries = useCallback(async () => {
    try {
      const list = await window.electronAPI.workspace.listSummaries()
      setSummaries(list)
    } catch {
      setSummaries([])
    }
  }, [])

  useEffect(() => {
    if (!open) return
    refreshSummaries()
  }, [open, refreshSummaries])

  useEffect(() => {
    if (!open) {
      setMenuOpenId(null)
      menuTriggerRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!menuOpenId) return
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('.workspace-modal__row-menu')) return
      if (el.closest('.workspace-modal__menu-popover')) return
      setMenuOpenId(null)
      menuTriggerRef.current = null
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpenId])

  const closed = summaries.filter((s) => !openIds.has(s.id))

  const handleCreate = () => {
    if (!rootPath) return
    const name = newName.trim() || rootPath.split(/[\\/]/).pop() || 'Untitled'
    addWorkspace(name, rootPath)
    setNewName('')
    setRootPath(null)
    void refreshSummaries()
    onClose()
  }

  const handleBrowse = async () => {
    const dir = await window.electronAPI.dialog.openDirectory()
    if (dir) setRootPath(dir)
  }

  const startRename = (id: string, currentName: string) => {
    setMenuOpenId(null)
    menuTriggerRef.current = null
    setRenamingId(id)
    setRenameDraft(currentName)
  }

  const cancelRename = () => {
    setRenamingId(null)
    setRenameDraft('')
  }

  const commitRename = async () => {
    if (!renamingId) return
    const id = renamingId
    const draft = renameDraft
    setRenamingId(null)
    setRenameDraft('')
    await renameWorkspace(id, draft)
    void refreshSummaries()
  }

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Delete this workspace permanently? Saved layout on disk will be removed.',
      )
    ) {
      return
    }
    setMenuOpenId(null)
    menuTriggerRef.current = null
    await deleteWorkspacePermanently(id)
    void refreshSummaries()
  }

  const handleOpenClosed = async (id: string) => {
    await openWorkspace(id)
    void refreshSummaries()
  }

  const toggleMenu = (id: string, e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const btn = e.currentTarget
    if (menuOpenId === id) {
      setMenuOpenId(null)
      menuTriggerRef.current = null
    } else {
      menuTriggerRef.current = btn
      setMenuOpenId(id)
    }
  }

  const openWs = menuOpenId ? workspaces.find((w) => w.id === menuOpenId) : undefined
  const closedWs = menuOpenId ? summaries.find((s) => s.id === menuOpenId) : undefined

  const menuPopover =
    menuOpenId &&
    !renamingId &&
    (openWs || closedWs) &&
    createPortal(
      <div
        ref={menuPopoverRef}
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
              onClick={() => startRename(openWs.id, openWs.name)}
            >
              Rename…
            </button>
            <button
              type="button"
              className="workspace-modal__menu-item workspace-modal__menu-item--danger"
              role="menuitem"
              onClick={() => void handleDelete(openWs.id)}
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
              onClick={() => startRename(closedWs.id, closedWs.name)}
            >
              Rename…
            </button>
            <button
              type="button"
              className="workspace-modal__menu-item workspace-modal__menu-item--danger"
              role="menuitem"
              onClick={() => void handleDelete(closedWs.id)}
            >
              Delete permanently…
            </button>
          </>
        )}
      </div>,
      document.body,
    )

  if (!open) return null

  return (
    <div className="ext-modal-overlay" onClick={onClose}>
      {menuPopover}
      <div className="workspace-modal" onClick={(e) => e.stopPropagation()}>
        <div className="workspace-modal__header">
          <h2 className="workspace-modal__title">Workspaces</h2>
          <button
            type="button"
            className="workspace-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="workspace-modal__body">
          <section className="workspace-modal__section">
            <h3 className="workspace-modal__section-title">Open now</h3>
            {workspaces.length === 0 ? (
              <p className="workspace-modal__empty">No workspace is open.</p>
            ) : (
              <ul className="workspace-modal__list">
                {workspaces.map((ws) => (
                  <li key={ws.id} className="workspace-modal__list-li">
                    <div
                      className={`workspace-modal__row ${ws.id === activeWorkspaceId ? 'workspace-modal__row--active' : ''}`}
                    >
                      <button
                        type="button"
                        className="workspace-modal__row-main"
                        onClick={() => setActiveWorkspace(ws.id)}
                        title="Switch to this workspace"
                      >
                        {renamingId === ws.id ? (
                          <input
                            className="workspace-modal__rename-input"
                            value={renameDraft}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                void commitRename()
                              }
                              if (e.key === 'Escape') cancelRename()
                            }}
                            onBlur={() => void commitRename()}
                            autoFocus
                          />
                        ) : (
                          <>
                            <span className="workspace-modal__row-title">
                              <span className="workspace-modal__list-name">{ws.name}</span>
                              {ws.id === activeWorkspaceId && (
                                <span className="workspace-modal__badge">Active</span>
                              )}
                            </span>
                            <span className="workspace-modal__list-path" title={ws.rootPath}>
                              {ws.rootPath}
                            </span>
                          </>
                        )}
                      </button>
                      <div className="workspace-modal__row-menu">
                        <button
                          type="button"
                          className="workspace-modal__menu-trigger"
                          aria-label="Workspace actions"
                          aria-expanded={menuOpenId === ws.id}
                          onClick={(e) => toggleMenu(ws.id, e)}
                        >
                          ⋯
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="workspace-modal__section">
            <h3 className="workspace-modal__section-title">On disk (closed)</h3>
            {closed.length === 0 ? (
              <p className="workspace-modal__empty">No closed workspaces.</p>
            ) : (
              <ul className="workspace-modal__list">
                {closed.map((s) => (
                  <li key={s.id} className="workspace-modal__list-li">
                    <div className="workspace-modal__row">
                      <button
                        type="button"
                        className="workspace-modal__row-main"
                        onClick={() => void handleOpenClosed(s.id)}
                        title="Open this workspace"
                      >
                        {renamingId === s.id ? (
                          <input
                            className="workspace-modal__rename-input"
                            value={renameDraft}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                void commitRename()
                              }
                              if (e.key === 'Escape') cancelRename()
                            }}
                            onBlur={() => void commitRename()}
                            autoFocus
                          />
                        ) : (
                          <>
                            <span className="workspace-modal__list-name">{s.name}</span>
                            <span className="workspace-modal__list-path" title={s.rootPath}>
                              {s.rootPath}
                            </span>
                          </>
                        )}
                      </button>
                      <div className="workspace-modal__row-menu">
                        <button
                          type="button"
                          className="workspace-modal__menu-trigger"
                          aria-label="Workspace actions"
                          aria-expanded={menuOpenId === s.id}
                          onClick={(e) => toggleMenu(s.id, e)}
                        >
                          ⋯
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="workspace-modal__section">
            <h3 className="workspace-modal__section-title">Create new</h3>
            <div className="workspace-modal__field">
              <label className="workspace-modal__label" htmlFor="ws-name">
                Name
              </label>
              <input
                id="ws-name"
                className="workspace-modal__input"
                placeholder="Optional"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                }}
              />
            </div>
            <div className="workspace-modal__field workspace-modal__field--row">
              <span className="workspace-modal__path">
                {rootPath || 'No folder selected'}
              </span>
              <button type="button" className="workspace-modal__btn" onClick={handleBrowse}>
                Choose folder…
              </button>
            </div>
            <button
              type="button"
              className="workspace-modal__btn workspace-modal__btn--primary"
              onClick={handleCreate}
              disabled={!rootPath}
            >
              Create workspace
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
