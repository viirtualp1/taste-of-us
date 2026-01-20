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
    const { name, default_quantity } = body

    if (!name || !name.trim()) {
      throw createError({
        statusCode: 400,
        message: 'Item name is required',
      })
    }

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('common_items')
      .insert({
        user_id: userId,
        name: name.trim(),
        default_quantity: default_quantity?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to add common item: ${error.message}`,
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error adding common item:', error)
    throw error
  }
})
