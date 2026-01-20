import { getUserIdFromTelegram } from '../../utils/auth'
import { createSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const userId = await getUserIdFromTelegram(event)

    if (!userId) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized. Please log in via Telegram.',
      })
    }

    const itemId = getRouterParam(event, 'id')
    if (!itemId) {
      throw createError({
        statusCode: 400,
        message: 'Item ID is required',
      })
    }

    const supabase = createSupabaseClient()

    const { data: existing, error: fetchError } = await supabase
      .from('shopping_list_items')
      .select('user_id')
      .eq('id', itemId)
      .single()

    if (fetchError || !existing) {
      throw createError({
        statusCode: 404,
        message: 'Item not found',
      })
    }

    if (existing.user_id !== userId) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to delete this item',
      })
    }

    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to delete item: ${error.message}`,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting shopping list item:', error)
    throw error
  }
})
