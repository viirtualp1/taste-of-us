import { validateTelegramInitData, parseTelegramInitData } from '../../utils/telegram'
import { createSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{
    initData: string
  }>(event)

  if (!body.initData) {
    throw createError({
      statusCode: 400,
      message: 'Telegram init data is required',
    })
  }

  const botToken = config.telegramBotToken

  if (!botToken) {
    throw createError({
      statusCode: 500,
      message: 'Telegram bot token not configured',
    })
  }

  if (!validateTelegramInitData(body.initData, botToken)) {
    throw createError({
      statusCode: 401,
      message: 'Invalid Telegram init data',
    })
  }

  const parsedData = parseTelegramInitData(body.initData)

  if (!parsedData?.user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid Telegram user data',
    })
  }

  const telegramUser = parsedData.user
  const supabase = createSupabaseClient()

  let userId: string | null = null

  const { data: existingUser, error: findError } = await supabase
    .from('telegram_users')
    .select('user_id')
    .eq('telegram_id', telegramUser.id)
    .single()

  if (findError && findError.code !== 'PGRST116') {
    console.error('Error finding user:', findError)
  }

  if (existingUser) {
    userId = existingUser.user_id

    const { error: updateError } = await supabase
      .from('telegram_users')
      .update({
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name || null,
        username: telegramUser.username || null,
        language_code: telegramUser.language_code || null,
        photo_url: telegramUser.photo_url || null,
        is_premium: telegramUser.is_premium || false,
        updated_at: new Date().toISOString(),
      })
      .eq('telegram_id', telegramUser.id)

    if (updateError) {
      console.error('Error updating user:', updateError)
    }
  } else {
    const { data: newUser, error: createError } = await supabase
      .from('telegram_users')
      .insert({
        telegram_id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name || null,
        username: telegramUser.username || null,
        language_code: telegramUser.language_code || null,
        photo_url: telegramUser.photo_url || null,
        is_premium: telegramUser.is_premium || false,
      })
      .select('user_id')
      .single()

    if (createError) {
      throw createError({
        statusCode: 500,
        message: `Failed to create user: ${createError.message}`,
      })
    }

    userId = newUser.user_id

    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        telegram_chat_id: String(telegramUser.id),
      })

    if (settingsError) {
      console.error('Error creating user settings:', settingsError)
    }
  }

  return {
    success: true,
    user: {
      id: telegramUser.id,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      username: telegramUser.username,
      language_code: telegramUser.language_code,
      photo_url: telegramUser.photo_url,
      is_premium: telegramUser.is_premium,
    },
  }
})
