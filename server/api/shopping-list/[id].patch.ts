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

    const body = await readBody(event)
    const { is_checked, name, quantity } = body

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
        message: 'You do not have permission to modify this item',
      })
    }

    const updateData: Record<string, unknown> = {}
    if (typeof is_checked === 'boolean') updateData.is_checked = is_checked
    if (name !== undefined) updateData.name = name.trim()
    if (quantity !== undefined) updateData.quantity = quantity?.trim() || null

    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No valid fields to update',
      })
    }

    const { data, error } = await supabase
      .from('shopping_list_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to update item: ${error.message}`,
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating shopping list item:', error)
    throw error
  }
})
