import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from 'react'
import { PanelState, WorkspaceState, useIDEStore } from '../../stores/workspace.store'
import type { BookmarkNode, BrowserProfile } from '../../types/electron'
import { BookmarkTree } from './BookmarkTree'
import { BrowserImportModal } from './BrowserImportModal'
import { BrowserToolbar } from './BrowserToolbar'

interface Props {
  panel: PanelState
  workspace: WorkspaceState
}

type ElectronWebview = {
    loadURL: (u: string) => void
    getURL: () => string
    canGoBack: () => boolean
    canGoForward: () => boolean
    goBack: () => void
    goForward: () => void
    reload: () => void
    stop: () => void
    addEventListener: (ev: string, fn: (...args: unknown[]) => void) => void
    removeEventListener: (ev: string, fn: (...args: unknown[]) => void) => void
    setAttribute: (n: string, v: string) => void
  style: CSSStyleDeclaration
}

export function BrowserPanel({ panel, workspace: _workspace }: Props) {
  const updatePanel = useIDEStore((s) => s.updatePanel)

  const containerRef = useRef<HTMLDivElement>(null)
  const webviewRef = useRef<ElectronWebview | null>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const componentStateRef = useRef(panel.componentState)
  useEffect(() => {
    componentStateRef.current = panel.componentState
  }, [panel.componentState])

  const savedUrl = panel.componentState?.url || 'https://www.google.com'
  console.log('[DEBUG] BrowserPanel resolving savedUrl for panel', panel.id, '->', savedUrl)

  const [displayUrl, setDisplayUrl] = useState(savedUrl)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>(panel.componentState?.bookmarks || [])
  const [showImportModal, setShowImportModal] = useState(false)
  const [profiles, setProfiles] = useState<BrowserProfile[]>([])
  const [importStatus, setImportStatus] = useState('')

  useEffect(() => {
    const container = containerRef.current
    if (!container || webviewRef.current) return

    console.log(
      '[DEBUG] BrowserPanel mount effect running for panel',
      panel.id,
      'partition:',
      `persist:browser`,
      'src:',
      savedUrl,
    )

    const wv = document.createElement('webview') as unknown as ElectronWebview
    wv.setAttribute('partition', 'persist:browser')
    wv.setAttribute('src', savedUrl)
    wv.setAttribute('allowpopups', '')
    wv.style.width = '100%'
    wv.style.height = '100%'
    wv.style.border = 'none'
    wv.style.display = 'flex'
    wv.style.flex = '1'

    const onStartLoading = () => setIsLoading(true)
    const onStopLoading = () => setIsLoading(false)

    const handleNavigation = () => {
      try {
        const currentUrl = wv.getURL()
        console.log(`[DEBUG] BrowserPanel handleNavigation fired. currentUrl:`, currentUrl)
        if (!currentUrl || currentUrl === 'about:blank' || currentUrl === 'data:,') return

        setDisplayUrl(currentUrl)
        setCanGoBack(wv.canGoBack())
        setCanGoForward(wv.canGoForward())

        if (componentStateRef.current?.url !== currentUrl) {
          console.log('[DEBUG] BrowserPanel calling updatePanel for url:', currentUrl)
          updatePanel(panel.id, {
            componentState: { ...componentStateRef.current, url: currentUrl },
          })
        }
      } catch (err) {
        console.error('[DEBUG] BrowserPanel handleNavigation error:', err)
      }
    }

    wv.addEventListener('did-start-loading', onStartLoading)
    wv.addEventListener('did-stop-loading', onStopLoading)
    wv.addEventListener('did-navigate', handleNavigation)
    wv.addEventListener('did-navigate-in-page', handleNavigation)
    wv.addEventListener('load-commit', handleNavigation)

    container.appendChild(wv as unknown as Node)
    webviewRef.current = wv

    return () => {
      console.log('[DEBUG] BrowserPanel unmounting cleanup for panel', panel.id)
      wv.removeEventListener('did-start-loading', onStartLoading)
      wv.removeEventListener('did-stop-loading', onStopLoading)
      wv.removeEventListener('did-navigate', handleNavigation)
      wv.removeEventListener('did-navigate-in-page', handleNavigation)
      wv.removeEventListener('load-commit', handleNavigation)
    }
  }, [])

  const navigate = useCallback(
    (targetUrl: string) => {
      let processed = targetUrl.trim()
      if (!processed) return

      if (!/^https?:\/\//i.test(processed) && !/^file:\/\//i.test(processed)) {
        if (/^[\w-]+(\.[\w-]+)+/.test(processed)) {
          processed = 'https://' + processed
        } else {
          processed = 'https://www.google.com/search?q=' + encodeURIComponent(processed)
        }
      }

      setDisplayUrl(processed)
      webviewRef.current?.loadURL(processed)
      updatePanel(panel.id, {
        componentState: { ...componentStateRef.current, url: processed },
      })
    },
    [panel.id, updatePanel],
  )

  const handleUrlKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        navigate(displayUrl)
        urlInputRef.current?.blur()
      }
    },
    [displayUrl, navigate],
  )

  const goBack = useCallback(() => webviewRef.current?.goBack(), [])
  const goForward = useCallback(() => webviewRef.current?.goForward(), [])
  const reload = useCallback(() => {
    if (isLoading) webviewRef.current?.stop()
    else webviewRef.current?.reload()
  }, [isLoading])

  const detectProfiles = useCallback(async () => {
    try {
      const detected = await window.electronAPI.browser.detectProfiles()
      setProfiles(detected)
    } catch (err) {
      console.error('Failed to detect profiles:', err)
    }
  }, [])

  const importProfile = useCallback(
    async (profilePath: string) => {
      setImportStatus('Importing profile data... Ensure the source browser is closed.')
      try {
        const result = await window.electronAPI.browser.importProfile(profilePath)
        setImportStatus(result.message)
        if (result.bookmarks) {
          setBookmarks(result.bookmarks)
          updatePanel(panel.id, {
            componentState: { ...panel.componentState, bookmarks: result.bookmarks },
          })
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setImportStatus('Import failed: ' + msg)
      }
    },
    [panel.id, panel.componentState, updatePanel],
  )

  const importBookmarksOnly = useCallback(
    async (profilePath: string) => {
      try {
        const result = await window.electronAPI.browser.importBookmarks(profilePath)
        if (result.bookmarks) {
          setBookmarks(result.bookmarks)
          updatePanel(panel.id, {
            componentState: { ...panel.componentState, bookmarks: result.bookmarks },
          })
          setImportStatus('Bookmarks imported successfully')
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setImportStatus('Bookmark import failed: ' + msg)
      }
    },
    [panel.id, panel.componentState, updatePanel],
  )

  return (
    <div className="browser-panel">
      <BrowserToolbar
        displayUrl={displayUrl}
        isLoading={isLoading}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        showBookmarks={showBookmarks}
        urlInputRef={urlInputRef}
        onDisplayUrlChange={setDisplayUrl}
        onUrlKeyDown={handleUrlKeyDown}
        onGoBack={goBack}
        onGoForward={goForward}
        onReload={reload}
        onToggleBookmarks={() => setShowBookmarks(!showBookmarks)}
        onOpenImport={() => {
          setShowImportModal(true)
          void detectProfiles()
        }}
      />

      <div className="browser-panel__body">
        {showBookmarks && bookmarks.length > 0 && (
          <div className="browser-panel__sidebar">
            <div className="browser-panel__sidebar-header">Bookmarks</div>
            <div className="browser-panel__sidebar-list">
              <BookmarkTree nodes={bookmarks} onNavigate={navigate} />
            </div>
          </div>
        )}
        <div className="browser-panel__webview-container" ref={containerRef} />
      </div>

      {showImportModal && (
        <BrowserImportModal
          profiles={profiles}
          importStatus={importStatus}
          onClose={() => setShowImportModal(false)}
          onImportProfile={importProfile}
          onImportBookmarksOnly={importBookmarksOnly}
        />
      )}
    </div>
  )
}
