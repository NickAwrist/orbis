/**
 * Default built-in theme for Dynamic IDE.
 * Uses Catppuccin Mocha colors in standard VSCode theme format.
 * This is the fallback theme when no VSX extension theme is active.
 */

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

const defaultTheme: VSCodeTheme = {
  name: 'Dynamic IDE Default (Catppuccin Mocha)',
  type: 'dark',
  colors: {
    // Base
    'foreground': '#cdd6f4',
    'descriptionForeground': '#a6adc8',
    'errorForeground': '#f38ba8',
    'focusBorder': '#89b4fa',
    'widget.shadow': '#00000066',
    'selection.background': '#585b7066',

    // Title bar
    'titleBar.activeBackground': '#11111b',
    'titleBar.activeForeground': '#cdd6f4',
    'titleBar.inactiveBackground': '#11111b',
    'titleBar.inactiveForeground': '#6c7086',

    // Activity bar
    'activityBar.background': '#11111b',
    'activityBar.foreground': '#89b4fa',
    'activityBar.inactiveForeground': '#6c7086',
    'activityBarBadge.background': '#89b4fa',
    'activityBarBadge.foreground': '#11111b',

    // Side bar
    'sideBar.background': '#181825',
    'sideBar.foreground': '#cdd6f4',
    'sideBarTitle.foreground': '#a6adc8',
    'sideBarSectionHeader.background': '#181825',
    'sideBarSectionHeader.foreground': '#a6adc8',

    // Editor
    'editor.background': '#1e1e2e',
    'editor.foreground': '#cdd6f4',
    'editor.lineHighlightBackground': '#252537',
    'editor.selectionBackground': '#585b7066',
    'editorCursor.foreground': '#f5e0dc',
    'editorLineNumber.foreground': '#6c7086',
    'editorLineNumber.activeForeground': '#a6adc8',
    'editorIndentGuide.background': '#383850',
    'editorIndentGuide.activeBackground': '#585b70',
    'editorWhitespace.foreground': '#383850',
    'editorBracketMatch.background': '#585b7033',
    'editorBracketMatch.border': '#585b70',

    // Editor groups & tabs
    'editorGroupHeader.tabsBackground': '#11111b',
    'editorGroup.border': '#383850',
    'tab.activeBackground': '#181825',
    'tab.activeForeground': '#cdd6f4',
    'tab.inactiveBackground': '#11111b',
    'tab.inactiveForeground': '#6c7086',
    'tab.border': '#383850',
    'tab.activeBorderTop': '#89b4fa',

    // Status bar
    'statusBar.background': '#11111b',
    'statusBar.foreground': '#a6adc8',
    'statusBar.debuggingBackground': '#fab387',
    'statusBar.debuggingForeground': '#11111b',
    'statusBar.noFolderBackground': '#11111b',
    'statusBar.noFolderForeground': '#a6adc8',
    'statusBarItem.hoverBackground': '#2e2e42',

    // Panel (terminal, output, etc.)
    'panel.background': '#1e1e2e',
    'panel.border': '#383850',
    'panelTitle.activeBorder': '#89b4fa',
    'panelTitle.activeForeground': '#cdd6f4',
    'panelTitle.inactiveForeground': '#6c7086',

    // Terminal
    'terminal.background': '#1e1e2e',
    'terminal.foreground': '#cdd6f4',
    'terminal.ansiBlack': '#45475a',
    'terminal.ansiRed': '#f38ba8',
    'terminal.ansiGreen': '#a6e3a1',
    'terminal.ansiYellow': '#f9e2af',
    'terminal.ansiBlue': '#89b4fa',
    'terminal.ansiMagenta': '#f5c2e7',
    'terminal.ansiCyan': '#94e2d5',
    'terminal.ansiWhite': '#bac2de',
    'terminal.ansiBrightBlack': '#585b70',
    'terminal.ansiBrightRed': '#f38ba8',
    'terminal.ansiBrightGreen': '#a6e3a1',
    'terminal.ansiBrightYellow': '#f9e2af',
    'terminal.ansiBrightBlue': '#89b4fa',
    'terminal.ansiBrightMagenta': '#f5c2e7',
    'terminal.ansiBrightCyan': '#94e2d5',
    'terminal.ansiBrightWhite': '#a6adc8',

    // Input
    'input.background': '#252537',
    'input.foreground': '#cdd6f4',
    'input.border': '#383850',
    'input.placeholderForeground': '#6c7086',

    // Dropdown
    'dropdown.background': '#252537',
    'dropdown.foreground': '#cdd6f4',
    'dropdown.border': '#383850',

    // Button
    'button.background': '#89b4fa',
    'button.foreground': '#11111b',
    'button.hoverBackground': '#74c7ec',
    'button.secondaryBackground': '#383850',
    'button.secondaryForeground': '#cdd6f4',
    'button.secondaryHoverBackground': '#45475a',

    // Badge
    'badge.background': '#89b4fa',
    'badge.foreground': '#11111b',

    // Scrollbar
    'scrollbar.shadow': '#00000033',
    'scrollbarSlider.background': '#38385066',
    'scrollbarSlider.hoverBackground': '#6c708666',
    'scrollbarSlider.activeBackground': '#a6adc866',

    // Lists and trees
    'list.activeSelectionBackground': '#383850',
    'list.activeSelectionForeground': '#cdd6f4',
    'list.inactiveSelectionBackground': '#2e2e42',
    'list.inactiveSelectionForeground': '#cdd6f4',
    'list.hoverBackground': '#2e2e42',
    'list.hoverForeground': '#cdd6f4',
    'list.focusBackground': '#383850',
    'list.highlightForeground': '#89b4fa',

    // Notifications
    'notifications.background': '#252537',
    'notifications.foreground': '#cdd6f4',
    'notifications.border': '#383850',

    // Progress bar
    'progressBar.background': '#89b4fa',

    // Editor widget
    'editorWidget.background': '#252537',
    'editorWidget.foreground': '#cdd6f4',
    'editorWidget.border': '#383850',

    // Peek view
    'peekView.border': '#89b4fa',
    'peekViewEditor.background': '#1e1e2e',
    'peekViewResult.background': '#181825',

    // Git decorations
    'gitDecoration.addedResourceForeground': '#a6e3a1',
    'gitDecoration.modifiedResourceForeground': '#f9e2af',
    'gitDecoration.deletedResourceForeground': '#f38ba8',
    'gitDecoration.untrackedResourceForeground': '#a6e3a1',
    'gitDecoration.conflictingResourceForeground': '#fab387',

    // Minimap
    'minimap.background': '#1e1e2e',

    // Breadcrumb
    'breadcrumb.foreground': '#6c7086',
    'breadcrumb.focusForeground': '#cdd6f4',
    'breadcrumb.activeSelectionForeground': '#cdd6f4',

    // Editor suggest widget
    'editorSuggestWidget.background': '#252537',
    'editorSuggestWidget.border': '#383850',
    'editorSuggestWidget.foreground': '#cdd6f4',
    'editorSuggestWidget.selectedBackground': '#383850',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#6c7086', fontStyle: 'italic' },
    },
    {
      scope: ['string', 'string.quoted'],
      settings: { foreground: '#a6e3a1' },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character'],
      settings: { foreground: '#fab387' },
    },
    {
      scope: ['variable', 'variable.other'],
      settings: { foreground: '#cdd6f4' },
    },
    {
      scope: ['variable.parameter'],
      settings: { foreground: '#eba0ac' },
    },
    {
      scope: ['keyword', 'keyword.control', 'storage.type', 'storage.modifier'],
      settings: { foreground: '#cba6f7' },
    },
    {
      scope: ['entity.name.function', 'support.function'],
      settings: { foreground: '#89b4fa' },
    },
    {
      scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
      settings: { foreground: '#f9e2af' },
    },
    {
      scope: ['entity.name.tag'],
      settings: { foreground: '#cba6f7' },
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#f9e2af', fontStyle: 'italic' },
    },
    {
      scope: ['punctuation'],
      settings: { foreground: '#9399b2' },
    },
    {
      scope: ['meta.brace', 'punctuation.definition.block'],
      settings: { foreground: '#9399b2' },
    },
    {
      scope: ['keyword.operator', 'keyword.operator.assignment'],
      settings: { foreground: '#94e2d5' },
    },
    {
      scope: ['constant.other.color', 'constant.other.rgb-value'],
      settings: { foreground: '#f5e0dc' },
    },
    {
      scope: ['support.constant', 'constant.other'],
      settings: { foreground: '#fab387' },
    },
    {
      scope: ['entity.name.module', 'entity.name.namespace'],
      settings: { foreground: '#f5c2e7' },
    },
    {
      scope: ['meta.decorator', 'punctuation.decorator'],
      settings: { foreground: '#fab387' },
    },
    {
      scope: ['invalid', 'invalid.illegal'],
      settings: { foreground: '#f38ba8' },
    },
    {
      scope: ['markup.heading'],
      settings: { foreground: '#89b4fa', fontStyle: 'bold' },
    },
    {
      scope: ['markup.bold'],
      settings: { fontStyle: 'bold' },
    },
    {
      scope: ['markup.italic'],
      settings: { fontStyle: 'italic' },
    },
    {
      scope: ['markup.inline.raw'],
      settings: { foreground: '#a6e3a1' },
    },
    {
      scope: ['string.other.link', 'markup.underline.link'],
      settings: { foreground: '#89b4fa' },
    },
  ],
  semanticHighlighting: true,
}

export default defaultTheme
