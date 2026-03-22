export interface DirEntry {
  name: string
  path: string
  isDirectory: boolean
}

export interface TreeNode extends DirEntry {
  children?: TreeNode[]
  expanded?: boolean
}

export type ContextAction = 'newFile' | 'newFolder' | 'rename' | 'delete'

export interface ContextMenu {
  x: number
  y: number
  node: TreeNode | null
  parentPath: string
}

export interface InlineInputState {
  action: 'newFile' | 'newFolder' | 'rename'
  parentPath: string
  existingName?: string
  existingPath?: string
  depth: number
  afterIndex?: number
}
