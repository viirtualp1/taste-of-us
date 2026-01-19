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

  const supabase = createSupabaseClient()

  const { data: telegramUser } = await supabase
    .from('telegram_users')
    .select('user_id')
    .eq('telegram_id', telegramUserId)
    .single()

  if (!telegramUser) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: telegramUser.user_id,
        telegram_chat_id: body.telegram_chat_id || String(telegramUserId),
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
