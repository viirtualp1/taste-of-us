import { getUserIdFromTelegram } from '../../../../utils/auth'
import { createSupabaseClient } from '../../../../utils/supabase'

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

    const { data: dish, error: dishError } = await supabase
      .from('user_dishes')
      .select('user_id')
      .eq('id', dishId)
      .single()

    if (dishError || !dish) {
      throw createError({
        statusCode: 404,
        message: 'Dish not found',
      })
    }

    if (dish.user_id !== userId) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to view this dish',
      })
    }

    const { data, error } = await supabase
      .from('dish_ingredients')
      .select('id, name, quantity')
      .eq('dish_id', dishId)
      .order('created_at', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch ingredients: ${error.message}`,
      })
    }

    return data || []
  } catch (error) {
    console.error('Error fetching dish ingredients:', error)
    throw error
  }
})
