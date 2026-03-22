import { useLayoutEffect, useRef, useState } from 'react'
import type { HostStatus } from './extensionModalTypes'
import { IconPackage, IconSearch, IconTheme } from './ExtensionModalIcons'

type Tab = 'marketplace' | 'installed' | 'themes'

const TAB_ORDER: Tab[] = ['marketplace', 'installed', 'themes']
const TabIcon = { marketplace: IconSearch, installed: IconPackage, themes: IconTheme } as const

function tabLabel(id: Tab, installedCount: number, themesCount: number) {
  if (id === 'marketplace') return 'Marketplace'
  if (id === 'installed') return `Installed (${installedCount})`
  return `Themes (${themesCount})`
}

interface Props {
  tab: Tab
  installedCount: number
  themesCount: number
  hostStatus: HostStatus
  onTabChange: (tab: Tab) => void
  onLoadThemes: () => void
  onStartHost: () => void
}

export function ExtensionsModalSidebar({
  tab,
  installedCount,
  themesCount,
  hostStatus,
  onTabChange,
  onLoadThemes,
  onStartHost,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<Record<Tab, HTMLButtonElement | null>>({
    marketplace: null,
    installed: null,
    themes: null,
  })
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const sync = () => {
      const w = wrapRef.current
      const el = btnRef.current[tab]
      if (!w || !el) return
      const wr = w.getBoundingClientRect()
      const br = el.getBoundingClientRect()
      setIndicator({ top: br.top - wr.top + w.scrollTop, height: br.height })
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(wrap)
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [tab, installedCount, themesCount])

  return (
    <div className="ext-modal__sidebar">
      <div className="ext-modal__sidebar-header">
        <h3>Extensions</h3>
      </div>
      <div className="ext-modal__tabs" ref={wrapRef}>
        <span
          className="ext-modal__tab-indicator"
          aria-hidden
          style={
            indicator ? { top: indicator.top, height: indicator.height, opacity: 1 } : { opacity: 0 }
          }
        />
        {TAB_ORDER.map((id) => {
          const Icon = TabIcon[id]
          return (
            <button
              key={id}
              ref={(el) => {
                btnRef.current[id] = el
              }}
              type="button"
              className={`ext-modal__tab ${tab === id ? 'ext-modal__tab--active' : ''}`}
              onClick={() => {
                onTabChange(id)
                if (id === 'themes') onLoadThemes()
              }}
            >
              <Icon />
              {tabLabel(id, installedCount, themesCount)}
            </button>
          )
        })}
      </div>

      <div className="ext-modal__sidebar-footer">
        <div className="ext-modal__host-status">
          <span
            className={`ext-modal__host-dot ${hostStatus.running ? 'ext-modal__host-dot--on' : hostStatus.error ? 'ext-modal__host-dot--err' : ''}`}
          />
          <span>
            {hostStatus.starting
              ? 'Starting...'
              : hostStatus.running
                ? 'Host Running'
                : 'Host Stopped'}
          </span>
        </div>
        <button
          type="button"
          className="ext-modal__btn ext-modal__btn--sm"
          onClick={onStartHost}
          disabled={hostStatus.starting}
        >
          {hostStatus.starting ? 'Starting...' : hostStatus.running ? 'Restart Host' : 'Start Host'}
        </button>
      </div>
    </div>
  )
}
