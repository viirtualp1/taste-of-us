import crypto from 'crypto'

interface TelegramInitData {
  user?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    photo_url?: string
    is_premium?: boolean
  }
  auth_date: number
  hash: string
  [key: string]: any
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
): boolean {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')

    if (!hash) {
      return false
    }

    urlParams.delete('hash')

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (calculatedHash !== hash) {
      return false
    }

    const authDate = parseInt(urlParams.get('auth_date') || '0', 10)
    const currentTime = Math.floor(Date.now() / 1000)

    // Allow auth_date up to 7 days old (Telegram Web App initData can be reused)
    // This prevents 401 errors on page reload
    if (currentTime - authDate > 604800) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating Telegram init data:', error)
    return false
  }
}

export function parseTelegramInitData(initData: string): TelegramInitData | null {
  try {
    const urlParams = new URLSearchParams(initData)
    const userParam = urlParams.get('user')

    if (!userParam) {
      return null
    }

    const user = JSON.parse(userParam)
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10)
    const hash = urlParams.get('hash') || ''

    return {
      user,
      auth_date: authDate,
      hash,
    }
  } catch (error) {
    console.error('Error parsing Telegram init data:', error)
    return null
  }
}

export function getTelegramUserId(initData: string): number | null {
  const parsed = parseTelegramInitData(initData)
  return parsed?.user?.id || null
}
