import type { TreeNode } from './fileTreeTypes'

export function getPathSep(): string {
  return navigator.platform.startsWith('Win') ? '\\' : '/'
}

export function updateTreeAt(
  nodes: TreeNode[],
  indices: number[],
  updater: (node: TreeNode) => TreeNode,
): TreeNode[] {
  return nodes.map((n, i) => {
    if (i !== indices[0]) return n
    if (indices.length === 1) return updater(n)
    return {
      ...n,
      children: n.children ? updateTreeAt(n.children, indices.slice(1), updater) : n.children,
    }
  })
}
