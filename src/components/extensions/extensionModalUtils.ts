import type { InstalledExtension } from '../../types/electron'
import type { MarketplaceExtension } from './extensionModalTypes'

export function formatDownloads(n?: number): string {
  if (!n) return ''
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function getContribSummary(ext: InstalledExtension): string {
  const parts: string[] = []
  const c = ext.manifest.contributes
  if (!c) return 'No contributions'
  if (c.themes?.length) parts.push(`${c.themes.length} theme${c.themes.length > 1 ? 's' : ''}`)
  if (c.commands?.length) parts.push(`${c.commands.length} command${c.commands.length > 1 ? 's' : ''}`)
  if (c.languages?.length) parts.push(`${c.languages.length} language${c.languages.length > 1 ? 's' : ''}`)
  if (c.snippets?.length) parts.push('snippets')
  if (c.grammars?.length) parts.push('syntax')
  if (c.iconThemes?.length) parts.push('icon theme')
  const has = ext.manifest.main || ext.manifest.browser
  if (has) parts.push('activatable')
  return parts.length > 0 ? parts.join(' · ') : 'Static contribution'
}

export function isMarketplaceInstalled(
  installed: InstalledExtension[],
  ext: MarketplaceExtension,
): boolean {
  const matchId = `${ext.namespace}.${ext.name}`
  return installed.some((e) => e.id.startsWith(matchId))
}
