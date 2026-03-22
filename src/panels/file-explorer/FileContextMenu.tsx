import type { ContextAction } from './fileTreeTypes'

interface Props {
  x: number
  y: number
  hasNode: boolean
  onAction: (action: ContextAction) => void
}

export function FileContextMenu({ x, y, hasNode, onAction }: Props) {
  return (
    <div
      className="file-context-menu"
      style={{ left: x, top: y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button type="button" className="file-context-menu__item" onClick={() => onAction('newFile')}>
        New File
      </button>
      <button type="button" className="file-context-menu__item" onClick={() => onAction('newFolder')}>
        New Folder
      </button>
      {hasNode && (
        <>
          <div className="file-context-menu__divider" />
          <button type="button" className="file-context-menu__item" onClick={() => onAction('rename')}>
            Rename
          </button>
          <button
            type="button"
            className="file-context-menu__item file-context-menu__item--danger"
            onClick={() => onAction('delete')}
          >
            Delete
          </button>
        </>
      )}
    </div>
  )
}
