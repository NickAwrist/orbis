import type { InstalledExtension } from '../../types/electron'
import { getContribSummary } from './extensionModalUtils'
import { IconPanel, IconPauseCircle, IconPlay, IconPower, IconTrash } from './ExtensionModalIcons'

interface Props {
  ext: InstalledExtension
  iconUrl: string | null
  activating: string | null
  onActivate: (ext: InstalledExtension) => void
  onToggle: (extId: string, enabled: boolean) => void
  onUninstall: (extId: string) => void
  onOpenExtensionPanel: () => void
}

export function InstalledExtensionRow({
  ext,
  iconUrl,
  activating,
  onActivate,
  onToggle,
  onUninstall,
  onOpenExtensionPanel,
}: Props) {
  const hasRunnable = !!(ext.manifest.main || ext.manifest.browser)

  return (
    <div className="ext-modal__list-item">
      {iconUrl ? (
        <img className="ext-modal__list-item-icon" src={iconUrl} alt="" />
      ) : (
        <div className="ext-modal__list-item-icon ext-modal__list-item-icon--placeholder">Ext</div>
      )}
      <div className="ext-modal__list-item-info">
        <div className="ext-modal__list-item-name">
          {ext.manifest.displayName || ext.manifest.name}
        </div>
        <div className="ext-modal__list-item-publisher">{ext.manifest.publisher}</div>
        <div className="ext-modal__list-item-desc">{ext.manifest.description}</div>
        <div className="ext-modal__list-item-contrib">{getContribSummary(ext)}</div>
      </div>
      <div className="ext-modal__list-item-actions">
        <div className="ext-modal__btn-group">
          {hasRunnable && ext.enabled && (
            <>
              <button
                type="button"
                className="ext-modal__icon-btn ext-modal__icon-btn--primary"
                onClick={() => onActivate(ext)}
                disabled={activating !== null}
                title={activating === ext.id ? 'Activating...' : 'Activate'}
              >
                <IconPlay />
              </button>
              <button
                type="button"
                className="ext-modal__icon-btn"
                onClick={onOpenExtensionPanel}
                title="Open Panel"
              >
                <IconPanel />
              </button>
            </>
          )}
          <button
            type="button"
            className="ext-modal__icon-btn"
            onClick={() => onToggle(ext.id, !ext.enabled)}
            title={ext.enabled ? 'Disable' : 'Enable'}
          >
            {ext.enabled ? <IconPauseCircle /> : <IconPower />}
          </button>
          <button
            type="button"
            className="ext-modal__icon-btn ext-modal__icon-btn--danger"
            onClick={() => onUninstall(ext.id)}
            title="Uninstall"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
  )
}
