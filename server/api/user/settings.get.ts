// OLD SUPABASE AUTH - COMMENTED OUT FOR TELEGRAM WEB APP MIGRATION
/*
import { createSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized. Please log in.',
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token)

  if (authError || !user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token. Please log in again.',
    })
  }

  const { data: userSettings, error: settingsError } = await supabase
    .from('user_settings')
    .select('telegram_chat_id')
    .eq('user_id', user.id)
    .single()

  if (settingsError && settingsError.code !== 'PGRST116') {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user settings',
    })
  }

  return {
    telegram_chat_id: userSettings?.telegram_chat_id || null,
  }
})
*/

import { requireTelegramAuth } from '../../utils/auth'
import { createSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const telegramUserId = await requireTelegramAuth(event)

  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('telegram_users')
    .select(
      'recipient_telegram_chat_id, second_member_telegram_chat_id, cook_rotation_mode, cook_rotation_first',
    )
    .eq('telegram_id', telegramUserId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Settings GET:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch settings',
    })
  }

  return {
    telegram_chat_id: (data?.recipient_telegram_chat_id ?? '').trim() || '',
    second_member_telegram_chat_id:
      (data?.second_member_telegram_chat_id ?? '').trim() || '',
    cook_rotation_mode:
      (data?.cook_rotation_mode as 'none' | 'by_day' | 'by_week') || 'none',
    cook_rotation_first:
      (data?.cook_rotation_first as 'me' | 'partner') || 'me',
  }
})
