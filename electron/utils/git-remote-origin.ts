export interface GitRemoteWebInfo {
  repoUrl: string
  issuesUrl: string
  pullsUrl: string
  pullsLabel: 'Pull requests' | 'Merge requests'
}

/**
 * Turn a git remote URL into HTTPS repo and hosting issues/PR URLs.
 */
export function parseGitRemoteToWebInfo(raw: string): GitRemoteWebInfo | null {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (!trimmed) return null

  let repoUrl: string

  if (trimmed.startsWith('git@')) {
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) return null
    const host = trimmed.slice(4, colonIdx)
    let pathPart = trimmed.slice(colonIdx + 1)
    if (pathPart.endsWith('.git')) pathPart = pathPart.slice(0, -4)
    repoUrl = `https://${host}/${pathPart}`
  } else if (/^ssh:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed)
      let pathname = u.pathname.replace(/^\/+/, '')
      if (pathname.endsWith('.git')) pathname = pathname.slice(0, -4)
      repoUrl = `https://${u.hostname}${pathname ? `/${pathname}` : ''}`
    } catch {
      return null
    }
  } else if (/^git:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed)
      let pathname = u.pathname.replace(/^\/+/, '')
      if (pathname.endsWith('.git')) pathname = pathname.slice(0, -4)
      repoUrl = `https://${u.hostname}/${pathname}`
    } catch {
      return null
    }
  } else if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed)
      let pathname = u.pathname.replace(/^\/+/, '')
      if (pathname.endsWith('.git')) pathname = pathname.slice(0, -4)
      repoUrl = `${u.protocol}//${u.host}/${pathname}`
    } catch {
      return null
    }
  } else {
    return null
  }

  try {
    const u = new URL(repoUrl)
    const host = u.hostname.toLowerCase()
    const base = repoUrl.replace(/\/$/, '')
    const isGitLab = host.includes('gitlab')
    const isBitbucket = host.includes('bitbucket.org')

    const issuesUrl = isGitLab ? `${base}/-/issues` : `${base}/issues`
    let pullsUrl: string
    let pullsLabel: GitRemoteWebInfo['pullsLabel']
    if (isGitLab) {
      pullsUrl = `${base}/-/merge_requests`
      pullsLabel = 'Merge requests'
    } else if (isBitbucket) {
      pullsUrl = `${base}/pull-requests`
      pullsLabel = 'Pull requests'
    } else {
      pullsUrl = `${base}/pulls`
      pullsLabel = 'Pull requests'
    }

    return { repoUrl: base, issuesUrl, pullsUrl, pullsLabel }
  } catch {
    return null
  }
}
