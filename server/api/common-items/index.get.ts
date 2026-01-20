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

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('common_items')
      .select('id, name, default_quantity')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch common items: ${error.message}`,
      })
    }

    return data || []
  } catch (error) {
    console.error('Error fetching common items:', error)
    throw error
  }
})
