export interface MarketplaceExtension {
  name: string
  namespace: string
  displayName?: string
  description?: string
  version: string
  iconUrl?: string
  downloadUrl?: string
  downloadCount?: number
  averageRating?: number
  categories?: string[]
}

export interface HostStatus {
  running: boolean
  error: string | null
  stderr: string[]
  starting: boolean
}
