import type { ThemeInfo } from '../../types/electron'
import { getSavedThemeInfo } from '../../utils/theme-engine'
import { ThemeCard } from './ThemeCard'

interface Props {
  themes: ThemeInfo[]
  applyingTheme: string | null
  extensionThemeActive: boolean
  onApplyTheme: (theme: ThemeInfo) => void
  onResetBuiltin: () => void
}

function themeIsActive(theme: ThemeInfo): boolean {
  const saved = getSavedThemeInfo()
  if (!saved) return false
  return saved.label === theme.label && saved.extensionId === theme.extensionId
}

export function ThemesTab({
  themes,
  applyingTheme,
  extensionThemeActive,
  onApplyTheme,
  onResetBuiltin,
}: Props) {
  return (
    <div className="ext-modal__pane">
      {extensionThemeActive && (
        <div className="ext-modal__themes-toolbar">
          <p className="ext-modal__themes-toolbar-text">An extension theme is active.</p>
          <button
            type="button"
            className="ext-modal__btn ext-modal__btn--sm ext-modal__btn--secondary"
            onClick={onResetBuiltin}
            disabled={applyingTheme !== null}
          >
            Use built-in default
          </button>
        </div>
      )}
      <div className="ext-modal__list ext-modal__grid">
        {themes.length === 0 && (
          <div className="ext-modal__empty">
            No themes available. Install a theme extension from Marketplace.
          </div>
        )}
        {themes.map((theme) => {
          const key = `${theme.extensionId}:${theme.label}`
          return (
            <ThemeCard
              key={key}
              theme={theme}
              themeKey={key}
              isActive={themeIsActive(theme)}
              applyingTheme={applyingTheme}
              onApply={onApplyTheme}
            />
          )
        })}
      </div>
    </div>
  )
}
