import { useCallback } from 'react'
import { useIDEStore } from '../../stores/workspace.store'
import {
  WORKSPACE_TEMPLATE_LIST,
  type WorkspaceTemplateId,
} from '../../lib/workspace-templates'
import { WorkspaceTemplateMiniPreview } from './WorkspaceTemplateMiniPreview'

interface Props {
  layoutSize: { width: number; height: number }
}

export function WorkspaceTemplatePicker({ layoutSize }: Props) {
  const applyWorkspaceTemplate = useIDEStore((s) => s.applyWorkspaceTemplate)

  const onPick = useCallback(
    (id: WorkspaceTemplateId) => {
      const width = layoutSize.width > 0 ? layoutSize.width : 1280
      const height = layoutSize.height > 0 ? layoutSize.height : 800
      applyWorkspaceTemplate(id, { width, height })
    },
    [applyWorkspaceTemplate, layoutSize.height, layoutSize.width],
  )

  return (
    <div className="workspace-template-picker">
      <p className="workspace-template-picker__label">Start from a layout</p>
      <div className="workspace-template-picker__grid">
        {WORKSPACE_TEMPLATE_LIST.map((t) => (
          <button
            key={t.id}
            type="button"
            className="workspace-template-picker__card"
            onClick={() => onPick(t.id)}
          >
            <WorkspaceTemplateMiniPreview templateId={t.id} />
            <span className="workspace-template-picker__card-title">{t.title}</span>
            <span className="workspace-template-picker__card-desc">{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
