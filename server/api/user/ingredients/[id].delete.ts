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

    const ingredientId = getRouterParam(event, 'id')
    if (!ingredientId) {
      throw createError({
        statusCode: 400,
        message: 'Ingredient ID is required',
      })
    }

    const supabase = createSupabaseClient()

    const { data: ingredient, error: fetchError } = await supabase
      .from('dish_ingredients')
      .select('id, dish_id, user_dishes!inner(user_id)')
      .eq('id', ingredientId)
      .single()

    if (fetchError || !ingredient) {
      throw createError({
        statusCode: 404,
        message: 'Ingredient not found',
      })
    }

    const dishUserId = (ingredient.user_dishes as { user_id: string }).user_id
    if (dishUserId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to delete this ingredient',
      })
    }

    const { error } = await supabase
      .from('dish_ingredients')
      .delete()
      .eq('id', ingredientId)

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to delete ingredient: ${error.message}`,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting ingredient:', error)
    throw error
  }
})
