import { createSupabaseClient } from './supabase'

export async function getTelegramUserIdFromHeader(
  event: any,
): Promise<number | null> {
  const allHeaders = event.headers || event.node?.req?.headers || {}
  const userIdHeader =
    getHeader(event, 'x-telegram-user-id') ||
    getHeader(event, 'X-Telegram-User-Id') ||
    allHeaders['x-telegram-user-id'] ||
    allHeaders['X-Telegram-User-Id']

  if (!userIdHeader) {
    return null
  }

  const userId = parseInt(userIdHeader, 10)

  if (isNaN(userId)) {
    return null
  }

  return userId
}

export async function getUserIdFromTelegram(
  event: any,
): Promise<string | null> {
  const telegramUserId = await getTelegramUserIdFromHeader(event)

  if (!telegramUserId) {
    return null
  }

  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('telegram_users')
    .select('user_id')
    .eq('telegram_id', telegramUserId)
    .single()

  if (error || !data) {
    return null
  }

  return data.user_id
}

export async function requireTelegramAuth(event: any): Promise<number> {
  const telegramUserId = await getTelegramUserIdFromHeader(event)

  if (!telegramUserId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized. Please log in via Telegram.',
    })
  }

  return telegramUserId
}
