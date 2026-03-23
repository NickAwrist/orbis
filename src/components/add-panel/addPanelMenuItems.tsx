import { ReactNode } from 'react'
import type { PanelType } from '../../stores/panel-types'

/** Payload passed through submenu rows; parent decides how to add the panel. */
export type AddPanelSubmenuPick =
  | { kind: 'panel'; panelType: PanelType; state?: Record<string, unknown> }
  | { kind: 'extension-panel'; viewId: string }

export type AddPanelMenuLeaf = {
  kind: 'leaf'
  key: string
  panelType: PanelType
  label: string
  desc: string
  icon?: ReactNode
  state?: Record<string, unknown>
}

export type AddPanelMenuAction = {
  kind: 'action'
  key: string
  actionId: 'open-extensions'
  label: string
  desc: string
  icon?: ReactNode
}

export type AddPanelMenuSubmenu = {
  kind: 'submenu'
  id: string
  label: string
  desc: string
  icon?: ReactNode
  /** Shown when this submenu is open (optional). */
  submenuTitle?: string
  /** Inline choices (e.g. AI agents). */
  items?: Array<{
    key: string
    label: string
    desc: string
    icon?: ReactNode
    pick: AddPanelSubmenuPick
  }>
  /** Async choices (e.g. extension contributions). */
  loadItems?: () => Promise<
    Array<{
      key: string
      label: string
      desc: string
      icon?: ReactNode
      pick: AddPanelSubmenuPick
    }>
  >
}

export type AddPanelMenuEntry = AddPanelMenuLeaf | AddPanelMenuAction | AddPanelMenuSubmenu

const shellIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
)

const extensionsIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

export const ADD_PANEL_MENU_ENTRIES: AddPanelMenuEntry[] = [
  { kind: 'leaf', key: 'editor', panelType: 'editor', label: 'Code Editor', desc: 'Edit files with syntax highlighting' },
  { kind: 'leaf', key: 'shell', panelType: 'terminal', label: 'Shell', desc: 'Full terminal emulator', icon: shellIcon },
  {
    kind: 'submenu',
    id: 'ai-agents',
    label: 'AI agents',
    desc: 'Coding agents and agent UIs',
    submenuTitle: 'AI agents',
    items: [
      {
        key: 'claude',
        label: 'Claude Code',
        desc: 'Run Anthropic Claude Code',
        icon: <img src="/icons/claude.png" width="16" height="16" alt="Claude" />,
        pick: { kind: 'panel', panelType: 'terminal', state: { command: 'claude' } },
      },
      {
        key: 'gemini',
        label: 'Gemini CLI',
        desc: 'Run Google Gemini',
        icon: <img src="/icons/gemini.png" width="16" height="16" alt="Gemini" />,
        pick: { kind: 'panel', panelType: 'terminal', state: { command: 'gemini' } },
      },
      {
        key: 'codex',
        label: 'Codex',
        desc: 'Run OpenAI Codex',
        icon: <img src="/icons/codex.png" width="16" height="16" alt="Codex" />,
        pick: { kind: 'panel', panelType: 'terminal', state: { command: 'codex' } },
      },
      {
        key: 't3-code',
        label: 'T3 Code',
        desc: 'Graphical panel for the T3 coding agent',
        icon: <img src="/icons/t3_code.png" width="16" height="16" alt="T3 Code" />,
        pick: { kind: 'panel', panelType: 't3-code' },
      },
    ],
  },
  { kind: 'leaf', key: 'file-explorer', panelType: 'file-explorer', label: 'File Explorer', desc: 'Browse project files' },
  { kind: 'leaf', key: 'git', panelType: 'git', label: 'Git', desc: 'Stage, commit, and view history' },
  { kind: 'leaf', key: 'browser', panelType: 'browser', label: 'Browser', desc: 'Embedded web browser with profile import' },
  {
    kind: 'action',
    key: 'extensions',
    actionId: 'open-extensions',
    label: 'Extensions',
    desc: 'Browse and install VS Code extensions',
    icon: extensionsIcon,
  },
  {
    kind: 'submenu',
    id: 'extension-panel',
    label: 'Extension Panel',
    desc: 'Open a panel provided by an extension',
    submenuTitle: 'Extension panels',
    loadItems: async () => {
      try {
        const raw = await window.electronAPI.extensions.getRegisteredExtensionPanels()
        return raw.map((v) => ({
          key: v.viewId,
          label: v.viewId,
          desc: v.type,
          pick: { kind: 'extension-panel' as const, viewId: v.viewId },
        }))
      } catch {
        return []
      }
    },
  },
]
