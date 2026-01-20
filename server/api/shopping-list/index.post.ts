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

    const body = await readBody(event)
    const { name, quantity, source_type, source_dish_id, week_start } = body

    if (!name || !name.trim()) {
      throw createError({
        statusCode: 400,
        message: 'Item name is required',
      })
    }

    const validSourceTypes = ['dish', 'manual', 'common']
    const sourceType =
      source_type && validSourceTypes.includes(source_type)
        ? source_type
        : 'manual'

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert({
        user_id: userId,
        name: name.trim(),
        quantity: quantity?.trim() || null,
        source_type: sourceType,
        source_dish_id: source_dish_id || null,
        week_start: week_start || null,
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to add item: ${error.message}`,
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error adding shopping list item:', error)
    throw error
  }
})
