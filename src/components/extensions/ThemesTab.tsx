import type { ThemeInfo } from '../../types/electron'
import { ThemeCard } from './ThemeCard'

interface Props {
  themes: ThemeInfo[]
  applyingTheme: string | null
  onApplyTheme: (theme: ThemeInfo) => void
}

function themeIsActive(theme: ThemeInfo): boolean {
  const savedRaw = localStorage.getItem('dynamic-ide-theme')
  if (!savedRaw) return false
  try {
    const s = JSON.parse(savedRaw) as { label?: string; extensionId?: string }
    return s.label === theme.label && s.extensionId === theme.extensionId
  } catch {
    return false
  }
}

export function ThemesTab({ themes, applyingTheme, onApplyTheme }: Props) {
  return (
    <div className="ext-modal__view">
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
