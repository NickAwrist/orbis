import { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  panel: {
    id: string
    type: string
    viewId?: string
    title?: string
  }
}

export function ExtensionPanel({ panel }: Props) {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState<Array<{ viewId: string; type: string }>>([])
  const [selectedId, setSelectedId] = useState<string | null>(panel.viewId || null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (selectedId) return
    let cancelled = false
    const load = async () => {
      try {
        const items = await window.electronAPI.extensions.getRegisteredExtensionPanels()
        if (!cancelled) setRegistered(items)
      } catch {
        // silently ignore — extension host not ready
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [selectedId])

  const resolveAndLoad = useCallback(async (viewId: string) => {
    setSelectedId(viewId)
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.extensions.resolveWebviewView(viewId)
      if (result?.html) {
        setHtml(wrapHtml(result.html, viewId))
      } else {
        setError('Extension did not provide any HTML content for this panel.')
      }
    } catch (err: any) {
      setError(`Failed to load extension panel: ${err.message}`)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (panel.viewId) {
      resolveAndLoad(panel.viewId)
    }
  }, [panel.viewId, resolveAndLoad])

  useEffect(() => {
    if (!selectedId) return
    const unsub = window.electronAPI.extensions.onWebviewHtml((data) => {
      if (data.viewId === selectedId) {
        setHtml(wrapHtml(data.html, selectedId))
      }
    })
    return unsub
  }, [selectedId])

  useEffect(() => {
    if (!selectedId) return
    const unsub = window.electronAPI.extensions.onWebviewMessage((data) => {
      if (data.viewId === selectedId && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(data.message, '*')
      }
    })
    return unsub
  }, [selectedId])

  useEffect(() => {
    if (!selectedId) return
    const handler = (event: MessageEvent) => {
      if (event.source === iframeRef.current?.contentWindow) {
        window.electronAPI.extensions.sendWebviewMessage(selectedId, event.data)
      }
    }
    globalThis.addEventListener('message', handler)
    return () => globalThis.removeEventListener('message', handler)
  }, [selectedId])

  if (!selectedId) {
    return (
      <div className="ext-panel">
        <div className="ext-panel__picker">
          <h3>Select an extension contribution</h3>
          {loading && <div className="ext-panel__loading">Loading…</div>}
          {!loading && registered.length === 0 && (
            <div className="ext-panel__empty">
              No extension panels registered. Start the extension host and activate an extension first.
            </div>
          )}
          {registered.map((v) => (
            <button
              key={v.viewId}
              className="ext-panel__choice-btn"
              onClick={() => resolveAndLoad(v.viewId)}
            >
              <span className="ext-panel__choice-id">{v.viewId}</span>
              <span className="ext-panel__choice-type">{v.type}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="ext-panel">
      {loading && <div className="ext-panel__loading">Loading extension panel…</div>}
      {error && (
        <div className="ext-panel__error">
          <p>{error}</p>
          <button className="ext-panel__retry" onClick={() => resolveAndLoad(selectedId)}>
            Retry
          </button>
        </div>
      )}
      {html && (
        <iframe
          ref={iframeRef}
          className="ext-panel__iframe"
          srcDoc={html}
          sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
          title={panel.title || selectedId}
        />
      )}
    </div>
  )
}

function extractNonce(html: string): string | null {
  const match = html.match(/nonce-([A-Za-z0-9+/=]+)/)
  return match ? match[1] : null
}

function wrapHtml(html: string, viewId: string): string {
  if (html.includes('<html') || html.includes('<!DOCTYPE')) {
    const nonce = extractNonce(html)
    const bridge = getMessagingBridge(viewId, nonce)
    const injected = html.replace(/<head([^>]*)>/i, `<head$1>${bridge}`)
    return injected
  }
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{margin:0;padding:8px;font-family:sans-serif;color:#cdd6f4;background:#1e1e2e;}</style></head>
<body>${html}${getMessagingBridge(viewId, null)}</body>
</html>`
}

function getMessagingBridge(_viewId: string, nonce: string | null): string {
  const nonceAttr = nonce ? ` nonce="${nonce}"` : ''
  return `<script${nonceAttr}>
(function(){
  const vscode = {
    postMessage: function(msg) { window.parent.postMessage(msg, '*'); },
    setState: function(s) { window.__vscState = s; },
    getState: function() { return window.__vscState; }
  };
  window.acquireVsCodeApi = function() { return vscode; };
  window.addEventListener('message', function(e) {
    if (e.source === window.parent) {
      window.dispatchEvent(new MessageEvent('message', { data: e.data }));
    }
  });
})();
</script>`
}
