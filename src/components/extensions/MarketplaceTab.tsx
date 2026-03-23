import type { MarketplaceExtension } from './extensionModalTypes'
import type { InstalledExtension } from '../../types/electron'
import { IconSearch } from './ExtensionModalIcons'
import { MarketplaceExtensionCard } from './MarketplaceExtensionCard'

interface Props {
  query: string
  results: MarketplaceExtension[]
  searching: boolean
  installed: InstalledExtension[]
  installingId: string | null
  onQueryChange: (value: string) => void
  onSelect: (ext: MarketplaceExtension) => void
  onInstall: (ext: MarketplaceExtension) => void
}

export function MarketplaceTab({
  query,
  results,
  searching,
  installed,
  installingId,
  onQueryChange,
  onSelect,
  onInstall,
}: Props) {
  return (
    <div className="ext-modal__pane">
      <div className="ext-modal__search">
        <IconSearch className="ext-modal__search-icon" />
        <input
          className="ext-modal__search-input"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search extensions on Open VSX..."
          spellCheck={false}
        />
        {searching && <span className="ext-modal__search-spinner" />}
      </div>
      <div className="ext-modal__list ext-modal__grid">
        {results.length === 0 && !searching && query && (
          <div className="ext-modal__empty">No extensions found</div>
        )}
        {!query && !searching && (
          <div className="ext-modal__empty">Search for extensions to install</div>
        )}
        {results.map((ext) => (
          <MarketplaceExtensionCard
            key={`${ext.namespace}.${ext.name}`}
            ext={ext}
            installed={installed}
            installingId={installingId}
            onSelect={onSelect}
            onInstall={onInstall}
          />
        ))}
      </div>
    </div>
  )
}
