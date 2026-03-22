import type { MarketplaceExtension } from './extensionModalTypes'
import { formatDownloads, isMarketplaceInstalled } from './extensionModalUtils'
import type { InstalledExtension } from '../../types/electron'

interface Props {
  ext: MarketplaceExtension
  installed: InstalledExtension[]
  installingId: string | null
  onSelect: (ext: MarketplaceExtension) => void
  onInstall: (ext: MarketplaceExtension) => void
}

export function MarketplaceExtensionCard({
  ext,
  installed,
  installingId,
  onSelect,
  onInstall,
}: Props) {
  const extId = `${ext.namespace}.${ext.name}`
  const alreadyInstalled = isMarketplaceInstalled(installed, ext)

  return (
    <div className="ext-modal__card" onClick={() => onSelect(ext)}>
      <div className="ext-modal__card-top">
        {ext.iconUrl ? (
          <img className="ext-modal__card-icon" src={ext.iconUrl} alt="" />
        ) : (
          <div className="ext-modal__card-icon ext-modal__card-icon--placeholder">Ext</div>
        )}
        <div className="ext-modal__card-info">
          <div className="ext-modal__card-name">{ext.displayName || ext.name}</div>
          <div className="ext-modal__card-publisher">{ext.namespace}</div>
        </div>
      </div>
      <div className="ext-modal__card-desc">{ext.description}</div>
      <div className="ext-modal__card-actions">
        {ext.downloadCount !== undefined && (
          <span className="ext-modal__card-downloads">{formatDownloads(ext.downloadCount)}↓</span>
        )}
        {alreadyInstalled ? (
          <span className="ext-modal__card-badge">Installed</span>
        ) : (
          <button
            type="button"
            className="ext-modal__btn ext-modal__btn--install ext-modal__btn--sm"
            onClick={(e) => {
              e.stopPropagation()
              onInstall(ext)
            }}
            disabled={installingId !== null}
          >
            {installingId === extId ? '...' : 'Install'}
          </button>
        )}
      </div>
    </div>
  )
}
