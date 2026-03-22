/**
 * Canonical hierarchical scopes (proto-style). Root prefix: dynamic.ide
 */
export const Scopes = {
  mainExtensionProtocol: 'dynamic.ide.main.extension.protocol',
  mainExtensionHost: 'dynamic.ide.main.extension.host',
  mainExtensionHostProcess: 'dynamic.ide.main.extension.host.process',
  mainExtensionRpc: 'dynamic.ide.main.extension.rpc',
  mainExtensionBridge: 'dynamic.ide.main.extension.bridge',
  uiPanelBrowser: 'dynamic.ide.ui.panel.browser',
  uiPanelEditor: 'dynamic.ide.ui.panel.editor',
  uiPanelTerminal: 'dynamic.ide.ui.panel.terminal',
  uiPanelT3: 'dynamic.ide.ui.panel.t3',
  uiPanelExplorer: 'dynamic.ide.ui.panel.explorer',
  uiStoreWorkspace: 'dynamic.ide.ui.store.workspace',
  uiModalExtensions: 'dynamic.ide.ui.modal.extensions',
  uiThemeEngine: 'dynamic.ide.ui.theme.engine',
} as const

export type ScopeKey = keyof typeof Scopes
