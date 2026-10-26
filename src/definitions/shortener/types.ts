export type ShortUrlItem = {
  id: string
  originalUrl: string
  shortCode: string
  shortLink: string
  clickCount: number
  createdAt: string
  expiresAt: string | null
  isActive: boolean
  servedByInstance: string
}

export type CreateShortUrlPayload = {
  originalUrl: string
  customAlias?: string
  expiresInDays?: number
}

export type SystemStats = {
  totalUrls: number
  totalClicks: number
  instanceName: string
  environment: string
  redisConnected: boolean
  databaseConnected: boolean
}
