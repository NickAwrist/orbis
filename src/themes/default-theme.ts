/**
 * Default built-in theme for Orbis.
 * Based on Dark Monochrome Theme(SM) from SIRILMP.dark-theme-sm (MIT) — workbench + syntax
 * aligned to that extension’s palette; extra keys added for this app’s UI map.
 */

import darkMonochromeSm from './dark-monochrome-sm.json'

export interface VSCodeTheme {
  name: string
  type: 'dark' | 'light' | 'hc'
  colors: Record<string, string>
  tokenColors: Array<{
    name?: string
    scope?: string | string[]
    settings: {
      foreground?: string
      background?: string
      fontStyle?: string
    }
  }>
  semanticHighlighting?: boolean
  semanticTokenColors?: Record<string, any>
}

/** Keys used by theme-engine / workbench not present in the upstream theme JSON. */
const extraWorkbenchColors: Record<string, string> = {
  'foreground': '#E8E8E8',
  'descriptionForeground': '#A0A0A0',
  'errorForeground': '#AAAAAA',
  'widget.shadow': '#00000066',

  'sideBar.foreground': '#C8C8C8',

  'editor.lineHighlightBackground': '#141414',
  'editorIndentGuide.background': '#2A2A2A',
  'editorIndentGuide.activeBackground': '#3A3A3A',
  'editorWhitespace.foreground': '#2A2A2A',
  'editorBracketMatch.background': '#FFFFFF10',
  'editorBracketMatch.border': '#4A4A4A',

  'tab.activeForeground': '#E8E8E8',
  'tab.inactiveForeground': '#707070',
  'tab.activeBorderTop': '#888888',

  'editorGroup.border': '#2A2A2A',

  'panel.background': '#0D0D0D',
  'panel.border': '#2A2A2A',
  'panelTitle.activeBorder': '#888888',
  'panelTitle.activeForeground': '#E8E8E8',
  'panelTitle.inactiveForeground': '#707070',

  'statusBar.noFolderBackground': '#0D0D0D',
  'statusBar.noFolderForeground': '#C8C8C8',
  'statusBarItem.hoverBackground': '#2A2A2A',

  'activityBar.inactiveForeground': '#707070',

  'input.border': '#2A2A2A',
  'input.foreground': '#E8E8E8',
  'input.placeholderForeground': '#6A6A6A',

  'dropdown.foreground': '#E8E8E8',

  'button.secondaryBackground': '#2A2A2A',
  'button.secondaryForeground': '#E8E8E8',
  'button.secondaryHoverBackground': '#3A3A3A',

  'list.inactiveSelectionForeground': '#E8E8E8',

  'notifications.border': '#2A2A2A',

  'editorSuggestWidget.background': '#1A1A1A',
  'editorSuggestWidget.border': '#2A2A2A',
  'editorSuggestWidget.foreground': '#E8E8E8',
  'editorSuggestWidget.selectedBackground': '#2A2A2A',

  'peekView.border': '#888888',
  'peekViewEditor.background': '#0D0D0D',
  'peekViewResult.background': '#0D0D0D',

  'minimap.background': '#0D0D0D',

  'breadcrumb.foreground': '#707070',
  'breadcrumb.focusForeground': '#E8E8E8',
  'breadcrumb.activeSelectionForeground': '#E8E8E8',

  'gitDecoration.addedResourceForeground': '#CCCCCC',
  'gitDecoration.modifiedResourceForeground': '#AAAAAA',
  'gitDecoration.deletedResourceForeground': '#888888',
  'gitDecoration.untrackedResourceForeground': '#CCCCCC',
  'gitDecoration.conflictingResourceForeground': '#BBBBBB',

  'terminal.background': '#0D0D0D',
  'terminal.foreground': '#E8E8E8',
  'terminal.ansiBlack': '#2A2A2A',
  'terminal.ansiRed': '#9A9A9A',
  'terminal.ansiGreen': '#B0B0B0',
  'terminal.ansiYellow': '#C8C8C8',
  'terminal.ansiBlue': '#A8A8A8',
  'terminal.ansiMagenta': '#B8B8B8',
  'terminal.ansiCyan': '#A0A0A0',
  'terminal.ansiWhite': '#D8D8D8',
  'terminal.ansiBrightBlack': '#5A5A5A',
  'terminal.ansiBrightRed': '#D0D0D0',
  'terminal.ansiBrightGreen': '#D8D8D8',
  'terminal.ansiBrightYellow': '#E0E0E0',
  'terminal.ansiBrightBlue': '#C8C8C8',
  'terminal.ansiBrightMagenta': '#D0D0D0',
  'terminal.ansiBrightCyan': '#C0C0C0',
  'terminal.ansiBrightWhite': '#E8E8E8',
}

const defaultTheme: VSCodeTheme = {
  ...(darkMonochromeSm as VSCodeTheme),
  colors: {
    ...(darkMonochromeSm as VSCodeTheme).colors,
    ...extraWorkbenchColors,
  },
}

export default defaultTheme
