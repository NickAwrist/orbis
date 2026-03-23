import type { InstalledExtension } from '../../types/electron'
import { InstalledExtensionRow } from './InstalledExtensionRow'

interface Props {
  installed: InstalledExtension[]
  activating: string | null
  onActivate: (ext: InstalledExtension) => void
  onToggle: (extId: string, enabled: boolean) => void
  onUninstall: (extId: string) => void
  onOpenExtensionPanel: (ext: InstalledExtension) => void
}

function installedIconUrl(ext: InstalledExtension): string | null {
  if (!ext.manifest.icon) return null
  const iconPath = `${ext.extensionPath}/${ext.manifest.icon}`.replace(/\\/g, '/')
  return `vscode-webview-resource://${iconPath.startsWith('/') ? '' : '/'}${iconPath}`
}

export function InstalledTab({
  installed,
  activating,
  onActivate,
  onToggle,
  onUninstall,
  onOpenExtensionPanel,
}: Props) {
  return (
    <div className="ext-modal__pane">
      <div className="ext-modal__list">
        {installed.length === 0 && (
          <div className="ext-modal__empty">No extensions installed</div>
        )}
        {installed.map((ext) => (
          <InstalledExtensionRow
            key={ext.id}
            ext={ext}
            iconUrl={installedIconUrl(ext)}
            activating={activating}
            onActivate={onActivate}
            onToggle={onToggle}
            onUninstall={onUninstall}
            onOpenExtensionPanel={() => onOpenExtensionPanel(ext)}
          />
        ))}
      </div>
    </div>
  )
}
