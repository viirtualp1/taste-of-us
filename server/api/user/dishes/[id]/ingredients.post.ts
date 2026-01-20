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

    const body = await readBody(event)
    const { name, quantity } = body

    if (!name || !name.trim()) {
      throw createError({
        statusCode: 400,
        message: 'Ingredient name is required',
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
        message: 'You do not have permission to modify this dish',
      })
    }

    const { data, error } = await supabase
      .from('dish_ingredients')
      .insert({
        dish_id: dishId,
        name: name.trim(),
        quantity: quantity?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to add ingredient: ${error.message}`,
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error adding dish ingredient:', error)
    throw error
  }
})
