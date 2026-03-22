import { useState } from 'react'
import type { BookmarkNode } from '../../types/electron'

interface Props {
  nodes: BookmarkNode[]
  onNavigate: (url: string) => void
}

export function BookmarkTree({ nodes, onNavigate }: Props) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.children) {
          return <BookmarkFolder key={i} node={node} onNavigate={onNavigate} />
        }
        return (
          <button
            key={i}
            type="button"
            className="browser-panel__bookmark-item"
            onClick={() => node.url && onNavigate(node.url)}
            title={node.url}
          >
            {node.name}
          </button>
        )
      })}
    </>
  )
}

function BookmarkFolder({
  node,
  onNavigate,
}: {
  node: BookmarkNode
  onNavigate: (url: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="browser-panel__bookmark-folder">
      <button
        type="button"
        className="browser-panel__bookmark-folder-toggle"
        onClick={() => setOpen(!open)}
      >
        <span className="browser-panel__bookmark-folder-icon">{open ? '▾' : '▸'}</span>
        {node.name}
      </button>
      {open && node.children && (
        <div className="browser-panel__bookmark-folder-children">
          <BookmarkTree nodes={node.children} onNavigate={onNavigate} />
        </div>
      )}
    </div>
  )
}
