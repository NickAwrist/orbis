import { useState, useRef, useEffect, useCallback } from 'react'
import { useIDEStore } from '../stores/workspace.store'
import { AddPanelSubmenuDropdown, type AddPanelSubmenuRow } from './add-panel/AddPanelSubmenuDropdown'
import { Codicon } from './codicon/Codicon'
import {
  ADD_PANEL_MENU_ENTRIES,
  type AddPanelMenuEntry,
  type AddPanelSubmenuPick,
} from './add-panel/addPanelMenuItems'
import { OPEN_ADD_PANEL_EVENT } from '../lib/global-hotkeys'

type Props = { subscribeGlobalOpen?: boolean }

export function AddComponentMenu({ subscribeGlobalOpen = true }: Props) {
  const [open, setOpen] = useState(false)
  const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null)
  const [submenuRows, setSubmenuRows] = useState<AddPanelSubmenuRow<AddPanelSubmenuPick>[]>([])
  const [submenuLoading, setSubmenuLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const submenuLoadGen = useRef(0)
  const addPanel = useIDEStore((s) => s.addPanel)
  const activeWs = useIDEStore((s) => s.activeWorkspaceId)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!subscribeGlobalOpen) return
    const openFromHotkey = () => setOpen(true)
    window.addEventListener(OPEN_ADD_PANEL_EVENT, openFromHotkey)
    return () => window.removeEventListener(OPEN_ADD_PANEL_EVENT, openFromHotkey)
  }, [subscribeGlobalOpen])

  useEffect(() => {
    if (!open) {
      submenuLoadGen.current += 1
      setActiveSubmenuId(null)
      setSubmenuRows([])
      setSubmenuLoading(false)
    }
  }, [open])

  const closeMenu = useCallback(() => {
    setOpen(false)
    setActiveSubmenuId(null)
  }, [])

  const applyPick = useCallback(
    (pick: AddPanelSubmenuPick) => {
      if (pick.kind === 'panel') {
        addPanel(pick.panelType, pick.state)
      } else {
        addPanel('extension-panel', { viewId: pick.viewId, title: pick.viewId })
      }
      closeMenu()
    },
    [addPanel, closeMenu],
  )

  const openSubmenu = useCallback(async (entry: Extract<AddPanelMenuEntry, { kind: 'submenu' }>) => {
    const gen = ++submenuLoadGen.current
    setActiveSubmenuId(entry.id)
    if (entry.items) {
      setSubmenuLoading(false)
      setSubmenuRows(
        entry.items.map((i) => ({
          key: i.key,
          label: i.label,
          desc: i.desc,
          icon: i.icon,
          data: i.pick,
        })),
      )
      return
    }
    if (entry.loadItems) {
      setSubmenuLoading(true)
      setSubmenuRows([])
      try {
        const loaded = await entry.loadItems()
        if (gen !== submenuLoadGen.current) return
        setSubmenuRows(
          loaded.map((i) => ({
            key: i.key,
            label: i.label,
            desc: i.desc,
            icon: i.icon,
            data: i.pick,
          })),
        )
      } finally {
        if (gen === submenuLoadGen.current) setSubmenuLoading(false)
      }
    }
  }, [])

  const handleRootClick = useCallback(
    (entry: AddPanelMenuEntry) => {
      if (entry.kind === 'submenu') {
        void openSubmenu(entry)
        return
      }
      if (entry.kind === 'leaf') {
        addPanel(entry.panelType, entry.state)
        closeMenu()
      }
    },
    [addPanel, closeMenu, openSubmenu],
  )

  const activeSubmenuEntry =
    activeSubmenuId === null
      ? undefined
      : (ADD_PANEL_MENU_ENTRIES.find(
          (e): e is Extract<AddPanelMenuEntry, { kind: 'submenu' }> =>
            e.kind === 'submenu' && e.id === activeSubmenuId,
        ) ?? undefined)

  if (!activeWs) return null

  const extensionEmptyFooter =
    activeSubmenuId === 'extension-panel' ? (
      <button
        type="button"
        className="add-menu__item"
        onClick={() => {
          addPanel('extension-panel')
          closeMenu()
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'flex', color: 'var(--accent, #89b4fa)' }}>
            <Codicon name="extensions" />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span className="add-menu__item-label">Open Empty (pick later)</span>
            <span className="add-menu__item-desc">Choose the contribution after the panel opens</span>
          </div>
        </div>
      </button>
    ) : null

  return (
    <div className="add-menu" ref={menuRef}>
      <button
        className="add-menu__trigger"
        style={{ width: 'auto', padding: '0 8px', gap: '4px' }}
        onClick={() => setOpen(!open)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span style={{ fontSize: '11px', fontWeight: 600 }}>Add Panel</span>
      </button>
      {open && !activeSubmenuId && (
        <div className="add-menu__dropdown">
          {ADD_PANEL_MENU_ENTRIES.map((entry) => (
            <button
              key={entry.kind === 'submenu' ? entry.id : entry.key}
              type="button"
              className="add-menu__item"
              onClick={() => handleRootClick(entry)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'flex', color: 'var(--accent, #89b4fa)' }}>{entry.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span className="add-menu__item-label">{entry.label}</span>
                  <span className="add-menu__item-desc">{entry.desc}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && activeSubmenuId && activeSubmenuEntry && (
        <AddPanelSubmenuDropdown
          title={activeSubmenuEntry.submenuTitle}
          onBack={() => {
            setActiveSubmenuId(null)
            setSubmenuRows([])
          }}
          items={submenuRows}
          loading={submenuLoading}
          emptyMessage={
            activeSubmenuId === 'extension-panel'
              ? 'No extension panels available. Start the host and activate extensions first.'
              : 'No options available.'
          }
          onSelect={(row) => applyPick(row.data)}
          footer={extensionEmptyFooter}
        />
      )}
    </div>
  )
}
