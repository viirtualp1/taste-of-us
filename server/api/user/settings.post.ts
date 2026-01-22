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

  const body = await readBody<{
    telegram_chat_id: string | null
  }>(event)

  // Upsert user settings
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: user.id,
        telegram_chat_id: body.telegram_chat_id || null,
      },
      {
        onConflict: 'user_id',
      },
    )
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to save settings',
    })
  }

  return {
    success: true,
    settings: data,
  }
})
*/

import { requireTelegramAuth } from '../../utils/auth'
import { createSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const telegramUserId = await requireTelegramAuth(event)

  const body = await readBody<{
    telegram_chat_id?: string | null
  }>(event)
  const value = (body.telegram_chat_id ?? '').trim() || null

  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('telegram_users')
    .update({ recipient_telegram_chat_id: value })
    .eq('telegram_id', telegramUserId)
    .select('recipient_telegram_chat_id')
    .single()

  if (error) {
    console.error('Settings POST:', error.message, error.code, error.details)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to save settings',
    })
  }

  return {
    success: true,
    settings: { telegram_chat_id: data?.recipient_telegram_chat_id ?? '' },
  }
})
