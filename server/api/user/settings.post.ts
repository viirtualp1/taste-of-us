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
    second_member_telegram_chat_id?: string | null
    cook_rotation_mode?: 'none' | 'by_day' | 'by_week'
    cook_rotation_first?: 'me' | 'partner'
  }>(event)

  const recipient = (body.telegram_chat_id ?? '').trim() || null
  const secondMember = (body.second_member_telegram_chat_id ?? '').trim() || null
  const rotationMode = body.cook_rotation_mode ?? 'none'
  const rotationFirst = body.cook_rotation_first ?? 'me'

  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('telegram_users')
    .update({
      recipient_telegram_chat_id: recipient,
      second_member_telegram_chat_id: secondMember,
      cook_rotation_mode: rotationMode,
      cook_rotation_first: rotationFirst,
    })
    .eq('telegram_id', telegramUserId)
    .select(
      'recipient_telegram_chat_id, second_member_telegram_chat_id, cook_rotation_mode, cook_rotation_first',
    )
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
    settings: {
      telegram_chat_id: (data?.recipient_telegram_chat_id ?? '').trim() || '',
      second_member_telegram_chat_id:
        (data?.second_member_telegram_chat_id ?? '').trim() || '',
      cook_rotation_mode:
        (data?.cook_rotation_mode as string) || 'none',
      cook_rotation_first:
        (data?.cook_rotation_first as string) || 'me',
    },
  }
})
