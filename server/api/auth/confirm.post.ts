import { createSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    token: string
    type?: string
  }>(event)

  if (!body.token) {
    throw createError({
      statusCode: 400,
      message: 'Token is required',
    })
  }

  const supabase = createSupabaseClient()

  // Verify the email confirmation token
  // Supabase sends tokens in different formats, try both methods
  let data: any = null
  let error: any = null

  // First try verifyOtp with token_hash
  const verifyResult = await supabase.auth.verifyOtp({
    token_hash: body.token,
    type: (body.type as any) || 'email',
  })

  if (verifyResult.error) {
    // If that fails, try with the token directly (some Supabase versions use this)
    const exchangeResult = await supabase.auth.exchangeCodeForSession(
      body.token,
    )
    if (exchangeResult.error) {
      error = verifyResult.error
    } else {
      data = exchangeResult.data
    }
  } else {
    data = verifyResult.data
  }

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message || 'Invalid or expired token',
    })
  }

  if (!data.user || !data.session) {
    throw createError({
      statusCode: 400,
      message: 'Failed to confirm email',
    })
  }

  // Ensure user_settings record exists
  const { error: settingsError } = await supabase.from('user_settings').upsert(
    {
      user_id: data.user.id,
      telegram_chat_id: null,
    },
    {
      onConflict: 'user_id',
    },
  )

  if (settingsError) {
    console.error('Error creating user settings:', settingsError)
  }

  return {
    user: data.user,
    session: data.session,
  }
})
