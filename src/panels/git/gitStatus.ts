export interface FileStatus {
  path: string
  index: string
  working_dir: string
}

export function gitStatusIcon(index: string, wd: string): string {
  if (index === 'A' || wd === '?') return 'A'
  if (index === 'D') return 'D'
  if (index === 'R') return 'R'
  return 'M'
}

export function gitStatusClass(icon: string): string {
  switch (icon) {
    case 'A':
      return 'git-status--added'
    case 'D':
      return 'git-status--deleted'
    case 'R':
      return 'git-status--renamed'
    default:
      return 'git-status--modified'
  }
}
