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
    const { item_ids, week_start } = body

    if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'item_ids array is required',
      })
    }

    const supabase = createSupabaseClient()

    const { data: commonItems, error: fetchError } = await supabase
      .from('common_items')
      .select('id, name, default_quantity')
      .eq('user_id', userId)
      .in('id', item_ids)

    if (fetchError) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch common items: ${fetchError.message}`,
      })
    }

    if (!commonItems || commonItems.length === 0) {
      return { success: true, added: 0, message: 'No items found' }
    }

    const itemsToInsert = commonItems.map((item) => ({
      user_id: userId,
      name: item.name,
      quantity: item.default_quantity,
      source_type: 'common',
      week_start: week_start || null,
      is_checked: false,
    }))

    const { error: insertError } = await supabase
      .from('shopping_list_items')
      .insert(itemsToInsert)

    if (insertError) {
      throw createError({
        statusCode: 500,
        message: `Failed to add items: ${insertError.message}`,
      })
    }

    return {
      success: true,
      added: itemsToInsert.length,
      message: `Added ${itemsToInsert.length} items to shopping list`,
    }
  } catch (error) {
    console.error('Error adding common items to list:', error)
    throw error
  }
})
