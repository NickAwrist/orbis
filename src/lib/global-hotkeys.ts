import { useIDEStore } from '../stores/workspace.store'
import type { PanelType } from '../stores/panel-types'

export const OPEN_ADD_PANEL_EVENT = 'orbis:open-add-panel'

export function dispatchOpenAddPanelMenu() {
  window.dispatchEvent(new CustomEvent(OPEN_ADD_PANEL_EVENT))
}

function focusOrAddPanel(type: PanelType) {
  const { getActiveWorkspace, bringToFront, addPanel } = useIDEStore.getState()
  const ws = getActiveWorkspace()
  if (!ws) return
  const existing = ws.panels.find((p) => p.type === type)
  if (existing) bringToFront(existing.id)
  else addPanel(type)
}

/** Capture-phase handler so IDE chords win over Monaco, xterm, webviews, and inputs. */
export function handleGlobalKeydown(e: KeyboardEvent) {
  const mod = e.ctrlKey || e.metaKey
  if (!mod) return

  const state = useIDEStore.getState()

  if (e.shiftKey && (e.key === 'l' || e.key === 'L') && !e.altKey) {
    e.preventDefault()
    e.stopPropagation()
    state.setLogViewerOpen(!state.isLogViewerOpen)
    return
  }

  if (e.key === 'Tab' && !e.altKey) {
    const wss = state.workspaces
    if (wss.length <= 1) return
    e.preventDefault()
    e.stopPropagation()
    const idx = wss.findIndex((w) => w.id === state.activeWorkspaceId)
    const safeIdx = idx < 0 ? 0 : idx
    if (e.shiftKey) {
      const prev = (safeIdx - 1 + wss.length) % wss.length
      state.setActiveWorkspace(wss[prev].id)
    } else {
      const next = (safeIdx + 1) % wss.length
      state.setActiveWorkspace(wss[next].id)
    }
    return
  }

  if (e.altKey) return

  if (e.shiftKey) {
    const k = e.key
    if (k === 'n' || k === 'N') {
      e.preventDefault()
      e.stopPropagation()
      state.setWorkspaceManagerOpen(true)
      return
    }
    if (k === 'a' || k === 'A') {
      e.preventDefault()
      e.stopPropagation()
      dispatchOpenAddPanelMenu()
      return
    }
    if (k === 'x' || k === 'X') {
      e.preventDefault()
      e.stopPropagation()
      state.setExtensionsOpen(true)
      return
    }
    if (k === 'e' || k === 'E') {
      e.preventDefault()
      e.stopPropagation()
      focusOrAddPanel('file-explorer')
      return
    }
    if (k === 'g' || k === 'G') {
      e.preventDefault()
      e.stopPropagation()
      focusOrAddPanel('git')
      return
    }
  }

  if (!e.shiftKey && e.code === 'Backquote') {
    e.preventDefault()
    e.stopPropagation()
    focusOrAddPanel('terminal')
    return
  }

  if (!e.shiftKey) {
    const n = e.key.length === 1 ? parseInt(e.key, 10) : NaN
    if (!Number.isNaN(n) && n >= 1 && n <= 9) {
      const wss = state.workspaces
      if (n <= wss.length) {
        e.preventDefault()
        e.stopPropagation()
        state.setActiveWorkspace(wss[n - 1].id)
      }
    }
  }
}
