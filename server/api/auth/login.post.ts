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

  const supabase = createSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  })

  if (error) {
    throw createError({
      statusCode: 401,
      message: error.message || 'Invalid credentials',
    })
  }

  return {
    user: data.user,
    session: data.session,
  }
})
