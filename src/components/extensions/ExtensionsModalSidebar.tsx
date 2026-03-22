import type { HostStatus } from './extensionModalTypes'
import { IconPackage, IconSearch, IconTheme } from './ExtensionModalIcons'

type Tab = 'marketplace' | 'installed' | 'themes'

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
  return (
    <div className="ext-modal__sidebar">
      <div className="ext-modal__sidebar-header">
        <h3>Extensions</h3>
      </div>
      <div className="ext-modal__tabs">
        <button
          type="button"
          className={`ext-modal__tab ${tab === 'marketplace' ? 'ext-modal__tab--active' : ''}`}
          onClick={() => onTabChange('marketplace')}
        >
          <IconSearch />
          Marketplace
        </button>
        <button
          type="button"
          className={`ext-modal__tab ${tab === 'installed' ? 'ext-modal__tab--active' : ''}`}
          onClick={() => onTabChange('installed')}
        >
          <IconPackage />
          Installed ({installedCount})
        </button>
        <button
          type="button"
          className={`ext-modal__tab ${tab === 'themes' ? 'ext-modal__tab--active' : ''}`}
          onClick={() => {
            onTabChange('themes')
            onLoadThemes()
          }}
        >
          <IconTheme />
          Themes ({themesCount})
        </button>
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
