import type { WorkspaceTemplateId } from '../../lib/workspace-templates'

interface Props {
  templateId: WorkspaceTemplateId
}

export function WorkspaceTemplateMiniPreview({ templateId }: Props) {
  return (
    <div className="workspace-template-mini-preview" aria-hidden>
      {templateId === 'ide' && (
        <div className="workspace-template-mini-preview__ide">
          <div className="workspace-template-mini-preview__ide-top">
            <div className="workspace-template-mini-preview__ide-left">
              <div className="workspace-template-mini-preview__cell" />
              <div className="workspace-template-mini-preview__cell" />
            </div>
            <div className="workspace-template-mini-preview__cell workspace-template-mini-preview__cell--grow" />
          </div>
          <div className="workspace-template-mini-preview__term workspace-template-mini-preview__term--thin" />
        </div>
      )}
      {templateId === 'vibe' && (
        <div className="workspace-template-mini-preview__vibe">
          <div className="workspace-template-mini-preview__cell workspace-template-mini-preview__cell--git" />
          <div className="workspace-template-mini-preview__vibe-main">
            <div className="workspace-template-mini-preview__cell workspace-template-mini-preview__cell--grow" />
            <div className="workspace-template-mini-preview__cell workspace-template-mini-preview__cell--grow" />
          </div>
        </div>
      )}
      {templateId === 'hybrid' && (
        <div className="workspace-template-mini-preview__hybrid">
          <div className="workspace-template-mini-preview__hybrid-top">
            <div className="workspace-template-mini-preview__hybrid-left">
              <div className="workspace-template-mini-preview__cell" />
              <div className="workspace-template-mini-preview__cell" />
            </div>
            <div className="workspace-template-mini-preview__cell workspace-template-mini-preview__cell--grow" />
            <div className="workspace-template-mini-preview__hybrid-right">
              <div className="workspace-template-mini-preview__cell workspace-template-mini-preview__cell--tall" />
              <div className="workspace-template-mini-preview__cell" />
            </div>
          </div>
          <div className="workspace-template-mini-preview__term workspace-template-mini-preview__term--thick" />
        </div>
      )}
    </div>
  )
}
