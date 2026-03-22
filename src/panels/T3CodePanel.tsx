import { useState, useEffect, useRef } from 'react'
import { PanelState, WorkspaceState, useIDEStore } from '../stores/workspace.store'

interface Props {
  panel: PanelState
  workspace: WorkspaceState
}

export function T3CodePanel({ panel, workspace }: Props) {
  // Ignore saved urls for t3 code so it starts fresh every time and uses the correct new port
  const [url, setUrl] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [isStarting, setIsStarting] = useState(true) // assume starting until we verify
  
  const ptyIdRef = useRef<string | null>(null)
  const webviewRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const updatePanel = useIDEStore((s) => s.updatePanel)

  useEffect(() => {
    let isMounted = true

    const startServer = async () => {
      try {
        const ptyId = await window.electronAPI.pty.create({
          cols: 100,
          rows: 30,
          cwd: workspace.rootPath,
        })
        
        if (!isMounted) {
          // Immediately kill if unmounted during await
          window.electronAPI.pty.write(ptyId, '\x03')
          return () => {}
        }
        
        ptyIdRef.current = ptyId

        const cleanup = window.electronAPI.pty.onData((id, data) => {
          if (id !== ptyId) return
          
          setLogs(prev => {
            const newLogs = [...prev, data]
            return newLogs.slice(-40) // Keep recent logs
          })
        })

        // Use cross-env to set standard port variables so it avoids collisions
        const port = Math.floor(Math.random() * 1000) + 6000
        
        // Trust the generated port and unblock the UI after a short startup delay
        const serverUrl = `http://localhost:${port}`
        setTimeout(() => {
          if (isMounted) {
            setUrl(serverUrl)
            setIsStarting(false)
            updatePanel(panel.id, {
              componentState: { ...panel.componentState, url: serverUrl },
            })
          }
        }, 3500)

        setTimeout(() => {
          if (isMounted) {
             // cross-env is not enough because VITE_DEV_SERVER_URL leaks from the IDE's dev script
             // and forces T3 Code to redirect to the IDE's frontend! We must delete it from env.
             const nodeCmd = `node -e "const cp = require('child_process'); delete process.env.VITE_DEV_SERVER_URL; process.env.PORT='${port}'; process.env.T3CODE_PORT='${port}'; process.env.T3CODE_NO_BROWSER='1'; cp.spawnSync('npx', ['-y', 't3', '--no-browser'], {stdio: 'inherit', env: process.env, shell: true})"`
             window.electronAPI.pty.write(ptyId, nodeCmd + '\r')
          }
        }, 400)

        // return a teardown function
        return () => {
          cleanup()
          // Issue SIGINT equivalent to terminal to stop server
          window.electronAPI.pty.write(ptyId, '\x03')
        }
      } catch (err) {
        console.error('Failed to start T3 Server PTY', err)
        return () => {}
      }
    }

    const teardownPromise = startServer()

    return () => {
      isMounted = false
      teardownPromise.then(cleanupFn => cleanupFn())
    }
  }, [workspace.rootPath]) // deliberately ignore other deps to avoid restarting server on panel update

  useEffect(() => {
    if (!url || !containerRef.current || webviewRef.current) return

    const wv = document.createElement('webview') as any
    wv.setAttribute('src', url)
    wv.setAttribute('allowpopups', '')
    wv.style.width = '100%'
    wv.style.height = '100%'
    wv.style.border = 'none'
    wv.style.display = 'flex'
    wv.style.flex = '1'
    wv.style.backgroundColor = '#1e1e2e'

    containerRef.current.appendChild(wv)
    webviewRef.current = wv

    return () => {
      if (wv.parentElement) {
        wv.parentElement.removeChild(wv)
      }
      webviewRef.current = null
    }
  }, [url])

  useEffect(() => {
    const handleReload = (e: any) => {
      if (e.detail?.id === panel.id) {
        webviewRef.current?.reload()
      }
    }
    window.addEventListener('reload-t3-panel', handleReload)
    return () => window.removeEventListener('reload-t3-panel', handleReload)
  }, [panel.id])

  if (isStarting || !url) {
    return (
      <div style={{ padding: '20px', fontFamily: "'Cascadia Code', 'Consolas', monospace", color: '#cdd6f4', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1e1e2e', fontSize: '13px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Starting T3 Code Server...</h3>
        <p style={{ margin: '0 0 16px 0', color: '#a6adc8' }}>Spawning background server via npx -y t3.</p>
        <div style={{ flex: 1, backgroundColor: '#11111b', padding: '16px', borderRadius: '6px', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
          {logs.join('')}
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e2e' }}>
      <div ref={containerRef} style={{ flex: 1, display: 'flex' }} />
    </div>
  )
}
