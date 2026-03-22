import type { MarketplaceExtension } from './extensionModalTypes'
import { formatDownloads, isMarketplaceInstalled } from './extensionModalUtils'
import type { InstalledExtension } from '../../types/electron'

interface Props {
  selectedExt: MarketplaceExtension
  installed: InstalledExtension[]
  installingId: string | null
  error: string | null
  onBack: () => void
  onInstall: (ext: MarketplaceExtension) => void
}

export function MarketplaceDetailView({
  selectedExt,
  installed,
  installingId,
  error,
  onBack,
  onInstall,
}: Props) {
  const installedFlag = isMarketplaceInstalled(installed, selectedExt)
  const installKey = `${selectedExt.namespace}.${selectedExt.name}`

  return (
    <div className="ext-modal__detail">
      <div className="ext-modal__detail-header">
        <button type="button" className="ext-modal__back-btn" onClick={onBack}>
          ← Back to List
        </button>
      </div>
      <div className="ext-modal__detail-content">
        <div className="ext-modal__detail-top">
          {selectedExt.iconUrl && (
            <img className="ext-modal__detail-icon" src={selectedExt.iconUrl} alt="" />
          )}
          <div className="ext-modal__detail-info">
            <h2 className="ext-modal__detail-name">
              {selectedExt.displayName || selectedExt.name}
            </h2>
            <span className="ext-modal__detail-publisher">{selectedExt.namespace}</span>
            <span className="ext-modal__detail-version">v{selectedExt.version}</span>
            {selectedExt.downloadCount !== undefined && (
              <span className="ext-modal__detail-downloads">
                {formatDownloads(selectedExt.downloadCount)} downloads
              </span>
            )}
          </div>
        </div>
        <p className="ext-modal__detail-desc">{selectedExt.description}</p>
        {selectedExt.categories && selectedExt.categories.length > 0 && (
          <div className="ext-modal__detail-categories">
            {selectedExt.categories.map((c) => (
              <span key={c} className="ext-modal__category-tag">
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="ext-modal__detail-actions">
          {installedFlag ? (
            <button type="button" className="ext-modal__btn ext-modal__btn--installed" disabled>
              Installed
            </button>
          ) : (
            <button
              type="button"
              className="ext-modal__btn ext-modal__btn--install"
              onClick={() => onInstall(selectedExt)}
              disabled={installingId !== null}
            >
              {installingId === installKey ? 'Installing...' : 'Install'}
            </button>
          )}
        </div>
      </div>
      {error && <div className="ext-modal__error">{error}</div>}
    </div>
  )
}
