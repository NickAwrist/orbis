import type { MouseEvent, ReactNode, RefObject } from 'react'
import type { InlineInputState, TreeNode } from './fileTreeTypes'
import { getPathSep } from './fileTreeUtils'

interface FileTreeProps {
  tree: TreeNode[]
  workspaceRootPath: string
  inlineInput: InlineInputState | null
  inputValue: string
  inputRef: RefObject<HTMLInputElement | null>
  setInputValue: (v: string) => void
  setInlineInput: (v: InlineInputState | null) => void
  commitInlineInput: () => void
  toggleDir: (node: TreeNode, path: number[]) => Promise<void>
  openFileInEditor: (filePath: string) => void
  handleContextMenu: (e: MouseEvent, node: TreeNode | null, parentPath: string) => void
}

export function FileTree({
  tree,
  workspaceRootPath,
  inlineInput,
  inputValue,
  inputRef,
  setInputValue,
  setInlineInput,
  commitInlineInput,
  toggleDir,
  openFileInEditor,
  handleContextMenu,
}: FileTreeProps) {
  const renderInlineInput = (depth: number) => (
    <div className="file-node file-node--input" style={{ paddingLeft: depth * 16 + 8 }}>
      <span className="file-node__icon">{inlineInput?.action === 'newFolder' ? '+' : ' '}</span>
      <input
        ref={inputRef as RefObject<HTMLInputElement>}
        className="file-node__inline-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void commitInlineInput()
          if (e.key === 'Escape') {
            setInlineInput(null)
            setInputValue('')
          }
        }}
        onBlur={() => void commitInlineInput()}
      />
    </div>
  )

  const renderNode = (node: TreeNode, path: number[], depth: number): ReactNode => {
    const isRenaming = inlineInput?.action === 'rename' && inlineInput.existingPath === node.path

    return (
      <div key={node.path}>
        {isRenaming ? (
          <div className="file-node file-node--input" style={{ paddingLeft: depth * 16 + 8 }}>
            <span className="file-node__icon">
              {node.isDirectory ? (node.expanded ? '\u25BE' : '\u25B8') : ' '}
            </span>
            <input
              ref={inputRef as RefObject<HTMLInputElement>}
              className="file-node__inline-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void commitInlineInput()
                if (e.key === 'Escape') {
                  setInlineInput(null)
                  setInputValue('')
                }
              }}
              onBlur={() => void commitInlineInput()}
            />
          </div>
        ) : (
          <div
            className={`file-node ${node.isDirectory ? 'file-node--dir' : 'file-node--file'}`}
            style={{ paddingLeft: depth * 16 + 8 }}
            onClick={() => {
              if (node.isDirectory) void toggleDir(node, path)
              else openFileInEditor(node.path)
            }}
            onContextMenu={(e) => {
              const parentDir = node.path.substring(0, node.path.lastIndexOf(getPathSep()))
              handleContextMenu(e, node, parentDir)
            }}
          >
            <span className="file-node__icon">
              {node.isDirectory ? (node.expanded ? '\u25BE' : '\u25B8') : ' '}
            </span>
            <span className="file-node__name">{node.name}</span>
          </div>
        )}
        {node.isDirectory && node.expanded && (
          <div>
            {inlineInput &&
              (inlineInput.action === 'newFile' || inlineInput.action === 'newFolder') &&
              inlineInput.parentPath === node.path &&
              renderInlineInput(depth + 1)}
            {node.children?.map((child, i) => renderNode(child, [...path, i], depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="file-explorer-panel__tree">
      {inlineInput &&
        (inlineInput.action === 'newFile' || inlineInput.action === 'newFolder') &&
        inlineInput.parentPath === workspaceRootPath &&
        renderInlineInput(0)}
      {tree.length === 0 && !inlineInput ? (
        <div className="file-explorer-panel__empty">Empty directory</div>
      ) : (
        tree.map((node, i) => renderNode(node, [i], 0))
      )}
    </div>
  )
}
