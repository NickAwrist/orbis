interface Props {
  newName: string
  rootPath: string | null
  onNewNameChange: (v: string) => void
  onBrowse: () => void
  onCreate: () => void
}

export function CreateWorkspaceSection({
  newName,
  rootPath,
  onNewNameChange,
  onBrowse,
  onCreate,
}: Props) {
  return (
    <section className="workspace-modal__section">
      <h3 className="workspace-modal__section-title">Create New Workspace</h3>
      <div className="workspace-modal__field">
        <label className="workspace-modal__label" htmlFor="ws-name">
          Name
        </label>
        <input
          id="ws-name"
          className="workspace-modal__input"
          placeholder="Workspace name (optional)"
          value={newName}
          onChange={(e) => onNewNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCreate()
          }}
        />
      </div>
      <div className="workspace-modal__field workspace-modal__field--row">
        <span className="workspace-modal__path">{rootPath || 'No directory selected'}</span>
        <button type="button" className="workspace-modal__btn" onClick={onBrowse}>
          Browse...
        </button>
      </div>
      <button
        type="button"
        className="workspace-modal__btn workspace-modal__btn--primary"
        onClick={onCreate}
        disabled={!rootPath}
      >
        Create Workspace
      </button>
    </section>
  )
}
