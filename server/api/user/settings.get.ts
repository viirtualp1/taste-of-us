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
