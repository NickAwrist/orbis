import { useState, useEffect, useCallback } from 'react'
import { useIDEStore } from '../stores/workspace.store'

interface StatusBarItem {
  id: string
  text: string
  tooltip: string
  command?: string
  alignment: number // 1 = Left, 2 = Right
  priority: number
  visible: boolean
}

export function StatusBar() {
  const [items, setItems] = useState<StatusBarItem[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const activeWs = useIDEStore((s) =>
    s.workspaces.find((w) => w.id === s.activeWorkspaceId),
  )
  const setExtensionsOpen = useIDEStore((s) => s.setExtensionsOpen)
  const setLogViewerOpen = useIDEStore((s) => s.setLogViewerOpen)

  useEffect(() => {
    const cleanup = window.electronAPI.extensions.onStatusBarUpdate((item: StatusBarItem) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === item.id)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = item
          return updated
        }
        return [...prev, item]
      })
    })

    const cleanupRemove = window.electronAPI.extensions.onStatusBarRemove((id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id))
    })

    const cleanupMessage = window.electronAPI.extensions.onStatusBarMessage((text: string) => {
      setMessage(text)
      setTimeout(() => setMessage(null), 5000)
    })

    return () => {
      cleanup()
      cleanupRemove()
      cleanupMessage()
    }
  }, [])

  const handleClick = useCallback((command?: string) => {
    if (command) {
      window.electronAPI.extensions.executeCommand(command)
    }
  }, [])

  const visibleItems = items.filter((i) => i.visible)
  const leftItems = visibleItems
    .filter((i) => i.alignment === 1)
    .sort((a, b) => b.priority - a.priority)
  const rightItems = visibleItems
    .filter((i) => i.alignment === 2)
    .sort((a, b) => b.priority - a.priority)

  return (
    <div className="statusbar">
      <div className="statusbar__left">
        {activeWs && (
          <span className="statusbar__item statusbar__item--builtin">
            {activeWs.rootPath.split(/[\\/]/).pop()}
          </span>
        )}
        {leftItems.map((item) => (
          <button
            key={item.id}
            className={`statusbar__item ${item.command ? 'statusbar__item--clickable' : ''}`}
            title={item.tooltip}
            onClick={() => handleClick(item.command)}
          >
            {item.text}
          </button>
        ))}
        {message && (
          <span className="statusbar__item statusbar__message">{message}</span>
        )}
      </div>
      <div className="statusbar__right">
        {rightItems.map((item) => (
          <button
            key={item.id}
            className={`statusbar__item ${item.command ? 'statusbar__item--clickable' : ''}`}
            title={item.tooltip}
            onClick={() => handleClick(item.command)}
          >
            {item.text}
          </button>
        ))}
        <button
          type="button"
          className="statusbar__item statusbar__item--clickable statusbar__item--logs"
          title="Application logs (Ctrl+Shift+L)"
          onClick={() => setLogViewerOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ marginRight: '3px', flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Logs
        </button>
        <button
          type="button"
          className="statusbar__item statusbar__item--clickable"
          title="Extensions"
          onClick={() => setExtensionsOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          Extensions
        </button>
      </div>
    </div>
  )
}
