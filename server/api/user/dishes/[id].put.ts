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

    const body = await readBody(event)
    const { name, category, cuisine } = body

    if (!name || !category) {
      throw createError({
        statusCode: 400,
        message: 'Name and category are required',
      })
    }

    if (!['brunch', 'dinner', 'dessert'].includes(category)) {
      throw createError({
        statusCode: 400,
        message: 'Category must be brunch, dinner, or dessert',
      })
    }

    if (cuisine && !['asian', 'european', 'slavic'].includes(cuisine)) {
      throw createError({
        statusCode: 400,
        message: 'Cuisine must be asian, european, or slavic',
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
        message: 'You do not have permission to edit this dish',
      })
    }

    const updateData: {
      name: string
      category: string
      cuisine?: string | null
    } = {
      name: name.trim(),
      category,
    }

    if (cuisine) {
      updateData.cuisine = cuisine
    } else {
      updateData.cuisine = null
    }

    const { data, error } = await supabase
      .from('user_dishes')
      .update(updateData)
      .eq('id', dishId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw createError({
          statusCode: 400,
          message: 'A dish with this name already exists in this category',
        })
      }
      throw createError({
        statusCode: 500,
        message: `Failed to update dish: ${error.message}`,
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating user dish:', error)
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

    const body = await readBody(event)
    const { name, category, cuisine } = body

    if (!name || !category) {
      throw createError({
        statusCode: 400,
        message: 'Name and category are required',
      })
    }

    if (!['brunch', 'dinner', 'dessert'].includes(category)) {
      throw createError({
        statusCode: 400,
        message: 'Category must be brunch, dinner, or dessert',
      })
    }

    if (cuisine && !['asian', 'european', 'slavic'].includes(cuisine)) {
      throw createError({
        statusCode: 400,
        message: 'Cuisine must be asian, european, or slavic',
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
        message: 'You do not have permission to edit this dish',
      })
    }

    const updateData: {
      name: string
      category: string
      cuisine?: string | null
    } = {
      name: name.trim(),
      category,
    }

    if (cuisine) {
      updateData.cuisine = cuisine
    } else {
      updateData.cuisine = null
    }

    const { data, error } = await supabase
      .from('user_dishes')
      .update(updateData)
      .eq('id', dishId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw createError({
          statusCode: 400,
          message: 'A dish with this name already exists in this category',
        })
      }
      throw createError({
        statusCode: 500,
        message: `Failed to update dish: ${error.message}`,
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating user dish:', error)
    throw error
  }
})
