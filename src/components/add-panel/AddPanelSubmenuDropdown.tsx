import { ReactNode } from 'react'

export type AddPanelSubmenuRow<T = unknown> = {
  key: string
  label: string
  desc?: string
  icon: ReactNode
  data: T
}

type Props<T> = {
  onBack: () => void
  title?: string
  items: AddPanelSubmenuRow<T>[]
  loading?: boolean
  emptyMessage?: string
  onSelect: (row: AddPanelSubmenuRow<T>) => void
  footer?: ReactNode
}

export function AddPanelSubmenuDropdown<T>({
  onBack,
  title,
  items,
  loading = false,
  emptyMessage,
  onSelect,
  footer,
}: Props<T>) {
  const showEmpty = !loading && items.length === 0 && emptyMessage

  return (
    <div className="add-menu__dropdown">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 4px 8px' }}>
        <button type="button" className="add-menu__item add-menu__item--back" style={{ padding: '6px 10px', width: 'auto' }} onClick={onBack}>
          <span className="add-menu__item-label">← Back</span>
        </button>
        {title && (
          <span className="add-menu__item-label" style={{ fontSize: '12px', opacity: 0.85 }}>
            {title}
          </span>
        )}
      </div>
      {loading && (
        <div className="add-menu__item add-menu__item--empty">
          <span className="add-menu__item-desc">Loading…</span>
        </div>
      )}
      {showEmpty && (
        <div className="add-menu__item add-menu__item--empty">
          <span className="add-menu__item-desc">{emptyMessage}</span>
        </div>
      )}
      {!loading &&
        items.map((row) => (
          <button
            key={row.key}
            type="button"
            className="add-menu__item"
            onClick={() => onSelect(row)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'flex', color: 'var(--accent, #89b4fa)' }}>{row.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="add-menu__item-label">{row.label}</span>
                {row.desc && <span className="add-menu__item-desc">{row.desc}</span>}
              </div>
            </div>
          </button>
        ))}
      {footer}
    </div>
  )
}
