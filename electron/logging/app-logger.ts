import fs from 'fs'
import path from 'path'
import { app } from 'electron'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  ts: string
  level: LogLevel
  scope: string
  message: string
  detail?: string
}

const ROOT = 'orbis'
const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const LEVEL_LABEL: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERROR',
}

const SCOPE_MAX_SEGMENTS = 10
const SCOPE_MIN_SEGMENTS = 3
const RING_MAX = 2000
const FILE_MAX_BYTES = 2 * 1024 * 1024
const MAX_MESSAGE_LEN = 16_000
const MAX_DETAIL_LEN = 32_000
const SCOPE_COL_WIDTH = 44

let minLevel: LogLevel = 'info'
let ring: LogEntry[] = []
let listeners: Array<(entry: LogEntry) => void> = []
let filePath: string | null = null
let fileInitAttempted = false

export function isValidScope(scope: string): boolean {
  const parts = scope.split('.')
  if (parts.length < SCOPE_MIN_SEGMENTS || parts.length > SCOPE_MAX_SEGMENTS) return false
  if (parts[0] !== 'orbis') return false
  return parts.every((p) => /^[a-z0-9]+$/.test(p))
}

function normalizeScope(scope: string): string {
  const s = scope.trim().toLowerCase()
  if (!isValidScope(s)) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[app-logger] Invalid scope "${scope}", using orbis.misc.unknown`)
    }
    return 'orbis.misc.unknown'
  }
  return s
}

function joinChild(base: string, suffix: string): string {
  const s = suffix.trim().replace(/^\.+/, '').replace(/\.+$/, '')
  if (!s) return base
  return `${base}.${s}`
}

function ensureFilePath(): string | null {
  if (filePath) return filePath
  if (fileInitAttempted) return null
  fileInitAttempted = true
  try {
    const dir = path.join(app.getPath('userData'), 'logs')
    fs.mkdirSync(dir, { recursive: true })
    filePath = path.join(dir, 'app.log')
  } catch {
    filePath = null
  }
  return filePath
}

function rotateIfNeeded(fp: string): void {
  try {
    const st = fs.statSync(fp)
    if (st.size <= FILE_MAX_BYTES) return
    const bak = `${fp}.1`
    if (fs.existsSync(bak)) fs.unlinkSync(bak)
    fs.renameSync(fp, bak)
  } catch {
    /* ignore */
  }
}

function appendFileLine(line: string): void {
  const fp = ensureFilePath()
  if (!fp) return
  try {
    rotateIfNeeded(fp)
    fs.appendFileSync(fp, line + '\n', 'utf8')
  } catch {
    /* ignore */
  }
}

function pushRing(entry: LogEntry): void {
  ring.push(entry)
  if (ring.length > RING_MAX) ring = ring.slice(-RING_MAX)
}

function emit(entry: LogEntry): void {
  pushRing(entry)
  for (const fn of listeners) {
    try {
      fn(entry)
    } catch {
      /* ignore */
    }
  }
  const fileLine = JSON.stringify({
    ts: entry.ts,
    level: entry.level,
    scope: entry.scope,
    message: entry.message,
    ...(entry.detail ? { detail: entry.detail } : {}),
  })
  appendFileLine(fileLine)
}

function formatConsoleLine(entry: LogEntry): string {
  const scope =
    entry.scope.length > SCOPE_COL_WIDTH
      ? entry.scope.slice(0, SCOPE_COL_WIDTH - 1) + '…'
      : entry.scope.padEnd(SCOPE_COL_WIDTH)
  const msg = entry.detail ? `${entry.message} ${entry.detail}` : entry.message
  return `${entry.ts} ${LEVEL_LABEL[entry.level]} ${scope} ${msg}`
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel]
}

function write(
  level: LogLevel,
  scope: string,
  message: string,
  detail?: string,
): void {
  if (!shouldLog(level) && level !== 'warn' && level !== 'error') {
    return
  }

  const sc = normalizeScope(scope)
  const msg =
    message.length > MAX_MESSAGE_LEN ? message.slice(0, MAX_MESSAGE_LEN) + '…' : message
  const det =
    detail === undefined
      ? undefined
      : detail.length > MAX_DETAIL_LEN
        ? detail.slice(0, MAX_DETAIL_LEN) + '…'
        : detail

  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    scope: sc,
    message: msg,
    detail: det,
  }

  emit(entry)
  const line = formatConsoleLine(entry)
  switch (level) {
    case 'debug':
    case 'info':
      console.log(line)
      break
    case 'warn':
      console.warn(line)
      break
    case 'error':
      console.error(line)
      break
  }
}

export interface ScopedLogger {
  debug(message: string, detail?: string): void
  info(message: string, detail?: string): void
  warn(message: string, detail?: string): void
  error(message: string, detail?: string): void
  child(suffix: string): ScopedLogger
}

function createScoped(scope: string): ScopedLogger {
  const sc = normalizeScope(scope)
  return {
    debug: (m, d) => write('debug', sc, m, d),
    info: (m, d) => write('info', sc, m, d),
    warn: (m, d) => write('warn', sc, m, d),
    error: (m, d) => write('error', sc, m, d),
    child: (suffix: string) => createScoped(joinChild(sc, suffix)),
  }
}

/** Prefix `orbis` + suffix, e.g. child('main.extension.host') */
export const loggerRoot = {
  child: (suffix: string): ScopedLogger => createScoped(joinChild(ROOT, suffix)),
}

export function forScope(fullScope: string): ScopedLogger {
  return createScoped(fullScope)
}

export function initAppLogger(): void {
  minLevel = app.isPackaged ? 'info' : 'debug'
}

export function getMinLevel(): LogLevel {
  return minLevel
}

export function getRecentLogs(): LogEntry[] {
  return ring.slice()
}

export function clearRingBuffer(): void {
  ring = []
}

export function subscribeLog(listener: (entry: LogEntry) => void): () => void {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

/** Renderer-originated log line (scope validated). */
export function writeFromRenderer(
  level: LogLevel,
  scope: string,
  message: string,
  detail?: string,
): void {
  if (!LEVEL_ORDER[level]) return
  write(level, scope, message, detail)
}

export function getLogFilePath(): string | null {
  return ensureFilePath()
}
