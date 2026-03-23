import type { PanelState, PanelType } from '../stores/panel-types'

export type WorkspaceTemplateId = 'ide' | 'vibe' | 'hybrid'

export const WORKSPACE_TEMPLATE_LIST: {
  id: WorkspaceTemplateId
  title: string
  description: string
}[] = [
  {
    id: 'ide',
    title: 'Classic IDE',
    description: 'Explorer and Git on the left, editor in the center, terminal along the bottom.',
  },
  {
    id: 'vibe',
    title: 'Vibe mode',
    description: 'Git strip, T3 Code, and browser—agentic flow with repo context.',
  },
  {
    id: 'hybrid',
    title: 'Hybrid',
    description: 'IDE layout plus T3 Code and browser on the right for coding and agents together.',
  },
]

const PAD = 8
const MIN_PANEL_W = 200
const MIN_PANEL_H = 150

function makePanel(
  nextId: () => string,
  type: PanelType,
  rect: { x: number; y: number; width: number; height: number },
  zIndex: number,
  componentState: Record<string, unknown> = {},
): PanelState {
  return {
    id: nextId(),
    type,
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.max(MIN_PANEL_W, Math.round(rect.width)),
    height: Math.max(MIN_PANEL_H, Math.round(rect.height)),
    zIndex,
    componentState,
  }
}

function ideTopStrip(w: number, h: number): {
  termH: number
  termY: number
  topY: number
  topH: number
  leftW: number
} {
  const termH = Math.min(
    Math.max(200, Math.floor(h * 0.28)),
    Math.max(MIN_PANEL_H, h - MIN_PANEL_H * 2 - PAD * 4),
  )
  const termY = h - termH - PAD
  const topY = PAD
  const topH = Math.max(MIN_PANEL_H * 2 + PAD, termY - topY - PAD)
  const leftW = Math.min(
    Math.max(220, Math.floor(w * 0.22)),
    Math.max(MIN_PANEL_W, w - MIN_PANEL_W - PAD * 4),
  )
  return { termH, termY, topY, topH, leftW }
}

/** Hybrid: slightly taller bottom terminal strip than classic IDE. */
function hybridTopStrip(w: number, h: number): {
  termH: number
  termY: number
  topY: number
  topH: number
  leftW: number
} {
  const termH = Math.min(
    Math.max(236, Math.floor(h * 0.33)),
    Math.max(MIN_PANEL_H, h - MIN_PANEL_H * 2 - PAD * 4),
  )
  const termY = h - termH - PAD
  const topY = PAD
  const topH = Math.max(MIN_PANEL_H * 2 + PAD, termY - topY - PAD)
  const leftW = Math.min(
    Math.max(220, Math.floor(w * 0.22)),
    Math.max(MIN_PANEL_W, w - MIN_PANEL_W - PAD * 4),
  )
  return { termH, termY, topY, topH, leftW }
}

export function buildWorkspaceTemplatePanels(
  templateId: WorkspaceTemplateId,
  canvasW: number,
  canvasH: number,
  nextId: () => string,
  baseZ: number,
): PanelState[] {
  const w = Math.max(640, canvasW)
  const h = Math.max(480, canvasH)
  const panels: PanelState[] = []
  let z = baseZ

  if (templateId === 'vibe') {
    const innerH = h - 2 * PAD
    const gitW = Math.min(
      Math.max(200, Math.floor(w * 0.15)),
      Math.max(MIN_PANEL_W, w - MIN_PANEL_W * 2 - PAD * 5),
    )
    const xMid = PAD + gitW + PAD
    const remainW = w - xMid - PAD
    const colW = Math.max(MIN_PANEL_W, Math.floor((remainW - PAD) / 2))
    const browserW = Math.max(MIN_PANEL_W, remainW - PAD - colW)

    z++
    panels.push(
      makePanel(nextId, 'git', { x: PAD, y: PAD, width: gitW, height: innerH }, z),
    )
    z++
    panels.push(
      makePanel(nextId, 't3-code', { x: xMid, y: PAD, width: colW, height: innerH }, z),
    )
    z++
    panels.push(
      makePanel(
        nextId,
        'browser',
        { x: xMid + colW + PAD, y: PAD, width: browserW, height: innerH },
        z,
      ),
    )
    return panels
  }

  if (templateId === 'ide') {
    const { termH, termY, topY, topH, leftW } = ideTopStrip(w, h)
    const midX = PAD + leftW + PAD
    const midW = Math.max(MIN_PANEL_W, w - midX - PAD)

    const explorerH = Math.max(MIN_PANEL_H, Math.floor((topH - PAD) / 2))
    const gitY = topY + explorerH + PAD
    const gitH = Math.max(MIN_PANEL_H, topY + topH - gitY)

    z++
    panels.push(
      makePanel(
        nextId,
        'file-explorer',
        { x: PAD, y: topY, width: leftW, height: explorerH },
        z,
      ),
    )
    z++
    panels.push(
      makePanel(nextId, 'git', { x: PAD, y: gitY, width: leftW, height: gitH }, z),
    )
    z++
    panels.push(
      makePanel(nextId, 'editor', { x: midX, y: topY, width: midW, height: topH }, z),
    )
    z++
    panels.push(
      makePanel(
        nextId,
        'terminal',
        { x: PAD, y: termY, width: w - 2 * PAD, height: termH },
        z,
      ),
    )
    return panels
  }

  const {
    termH: hybridTermH,
    termY: hybridTermY,
    topY: hyTopY,
    topH: hyTopH,
    leftW: hyLeftW,
  } = hybridTopStrip(w, h)

  const rightW = Math.min(
    Math.max(260, Math.floor(w * 0.28)),
    Math.max(MIN_PANEL_W, w - hyLeftW - MIN_PANEL_W - PAD * 5),
  )
  const editorW = Math.max(MIN_PANEL_W, w - PAD - hyLeftW - PAD - rightW - PAD * 2)
  const editorX = PAD + hyLeftW + PAD
  const rightX = editorX + editorW + PAD

  const explorerH = Math.max(MIN_PANEL_H, Math.floor((hyTopH - PAD) / 2))
  const gitY = hyTopY + explorerH + PAD
  const gitH = Math.max(MIN_PANEL_H, hyTopY + hyTopH - gitY)

  const t3H = Math.max(MIN_PANEL_H, Math.floor((hyTopH - PAD) * 0.72))
  const browserY = hyTopY + t3H + PAD
  const browserH = Math.max(MIN_PANEL_H, hyTopY + hyTopH - browserY)

  z++
  panels.push(
    makePanel(
      nextId,
      'file-explorer',
      { x: PAD, y: hyTopY, width: hyLeftW, height: explorerH },
      z,
    ),
  )
  z++
  panels.push(
    makePanel(nextId, 'git', { x: PAD, y: gitY, width: hyLeftW, height: gitH }, z),
  )
  z++
  panels.push(
    makePanel(nextId, 'editor', { x: editorX, y: hyTopY, width: editorW, height: hyTopH }, z),
  )
  z++
  panels.push(
    makePanel(
      nextId,
      't3-code',
      { x: rightX, y: hyTopY, width: rightW, height: t3H },
      z,
    ),
  )
  z++
  panels.push(
    makePanel(
      nextId,
      'browser',
      { x: rightX, y: browserY, width: rightW, height: browserH },
      z,
    ),
  )
  z++
  const termInset = 4
  panels.push(
    makePanel(
      nextId,
      'terminal',
      { x: termInset, y: hybridTermY, width: w - 2 * termInset, height: hybridTermH },
      z,
    ),
  )

  return panels
}
