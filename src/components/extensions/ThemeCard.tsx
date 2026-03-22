import type { ThemeInfo } from '../../types/electron'

interface Props {
  theme: ThemeInfo
  themeKey: string
  isActive: boolean
  applyingTheme: string | null
  onApply: (theme: ThemeInfo) => void
}

export function ThemeCard({ theme, themeKey, isActive, applyingTheme, onApply }: Props) {
  return (
    <div
      className={`ext-modal__card ext-modal__card--theme ${isActive ? 'ext-modal__card--active' : ''}`}
    >
      <div className="ext-modal__theme-preview" onClick={() => onApply(theme)} role="presentation">
        <div
          className="ext-modal__theme-preview-color1"
          style={{ background: theme.uiTheme === 'vs-dark' ? '#252526' : '#f3f3f3' }}
        />
        <div
          className="ext-modal__theme-preview-color2"
          style={{ background: theme.uiTheme === 'vs-dark' ? '#1e1e1e' : '#ffffff' }}
        />
      </div>
      <div className="ext-modal__card-info">
        <div className="ext-modal__card-name">
          {theme.label}
          {isActive && <span className="ext-modal__card-badge">Active</span>}
        </div>
        <div className="ext-modal__card-publisher">from {theme.extensionId}</div>
        <div className="ext-modal__theme-type">
          {theme.uiTheme === 'vs-dark'
            ? 'Dark'
            : theme.uiTheme === 'vs'
              ? 'Light'
              : 'High Contrast'}
        </div>
      </div>
      <div
        className="ext-modal__card-actions"
        style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: '4px' }}
      >
        <button
          type="button"
          className={`ext-modal__btn ext-modal__btn--sm ${isActive ? 'ext-modal__btn--installed' : 'ext-modal__btn--install'}`}
          onClick={() => onApply(theme)}
          disabled={applyingTheme !== null || isActive}
        >
          {applyingTheme === themeKey ? 'Applying...' : isActive ? 'Applied' : 'Apply Theme'}
        </button>
      </div>
    </div>
  )
}
