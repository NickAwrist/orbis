import type { AppLogLevel } from '../types/electron'
import { Scopes } from './app-scopes'

export { Scopes }

function write(level: AppLogLevel, scope: string, message: string, detail?: string): void {
  if (typeof window !== 'undefined' && window.electronAPI?.appLog) {
    window.electronAPI.appLog.write(level, scope, message, detail)
    return
  }
  const line = `${scope} ${message}${detail ? ` ${detail}` : ''}`
  switch (level) {
    case 'error':
      console.error(line)
      break
    case 'warn':
      console.warn(line)
      break
    default:
      console.log(line)
  }
}

export function createUiLogger(scope: string): {
  debug: (message: string, detail?: string) => void
  info: (message: string, detail?: string) => void
  warn: (message: string, detail?: string) => void
  error: (message: string, detail?: string) => void
  child: (suffix: string) => ReturnType<typeof createUiLogger>
} {
  const base = scope
  return {
    debug: (m, d) => write('debug', base, m, d),
    info: (m, d) => write('info', base, m, d),
    warn: (m, d) => write('warn', base, m, d),
    error: (m, d) => write('error', base, m, d),
    child: (suffix: string) => createUiLogger(`${base}.${suffix}`),
  }
}
