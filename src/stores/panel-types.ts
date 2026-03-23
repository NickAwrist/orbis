export type PanelType =
  | 'editor'
  | 'terminal'
  | 'file-explorer'
  | 'git'
  | 'browser'
  | 'extension-view'
  | 't3-code'

export interface PanelState {
  id: string
  type: PanelType
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  componentState: Record<string, any>
}
