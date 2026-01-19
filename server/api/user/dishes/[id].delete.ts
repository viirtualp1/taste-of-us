// OLD SUPABASE AUTH - COMMENTED OUT FOR TELEGRAM WEB APP MIGRATION
/*
import { createSupabaseClient } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
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

    const dishId = getRouterParam(event, 'id')
    if (!dishId) {
      throw createError({
        statusCode: 400,
        message: 'Dish ID is required',
      })
    }

    const { data: existingDish, error: fetchError } = await supabase
      .from('user_dishes')
      .select('user_id')
      .eq('id', dishId)
      .single()

    if (fetchError || !existingDish) {
      throw createError({
        statusCode: 404,
        message: 'Dish not found',
      })
    }

    if (existingDish.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to delete this dish',
      })
    }

    const { error } = await supabase
      .from('user_dishes')
      .delete()
      .eq('id', dishId)
      .eq('user_id', user.id)

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to delete dish: ${error.message}`,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting user dish:', error)
    throw error
  }
})
*/

import { getUserIdFromTelegram } from '../../../utils/auth'
import { createSupabaseClient } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const userId = await getUserIdFromTelegram(event)

    if (!userId) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized. Please log in via Telegram.',
      })
    }

    const dishId = getRouterParam(event, 'id')
    if (!dishId) {
      throw createError({
        statusCode: 400,
        message: 'Dish ID is required',
      })
    }

    const supabase = createSupabaseClient()

    const { data: existingDish, error: fetchError } = await supabase
      .from('user_dishes')
      .select('user_id')
      .eq('id', dishId)
      .single()

    if (fetchError || !existingDish) {
      throw createError({
        statusCode: 404,
        message: 'Dish not found',
      })
    }

    if (existingDish.user_id !== userId) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to delete this dish',
      })
    }

    const { error } = await supabase
      .from('user_dishes')
      .delete()
      .eq('id', dishId)
      .eq('user_id', userId)

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to delete dish: ${error.message}`,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting user dish:', error)
    throw error
  }
})
