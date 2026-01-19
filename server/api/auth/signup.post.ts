// OLD SUPABASE SIGNUP - COMMENTED OUT FOR TELEGRAM WEB APP MIGRATION
/*
import { createSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    email: string
    password: string
  }>(event)

  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required',
    })
  }

  if (body.password.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'Password must be at least 6 characters',
    })
  }

  const supabase = createSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      emailRedirectTo: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
    },
  })

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message || 'Failed to create account',
    })
  }

  // Create user_settings record (even if email not confirmed yet)
  if (data.user) {
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: data.user.id,
        telegram_chat_id: null,
      })

    if (settingsError) {
      console.error('Error creating user settings:', settingsError)
    }
  }

  // Return user but no session if email confirmation is required
  // Supabase will send confirmation email automatically
  return {
    user: data.user,
    session: data.session, // Will be null if email confirmation is required
  }
})
*/
