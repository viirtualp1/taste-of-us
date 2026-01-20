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

    const query = getQuery(event)
    const weekStart = query.week_start as string | undefined

    const supabase = createSupabaseClient()

    let dbQuery = supabase
      .from('shopping_list_items')
      .delete()
      .eq('user_id', userId)
      .eq('is_checked', true)

    if (weekStart) {
      dbQuery = dbQuery.eq('week_start', weekStart)
    }

    const { error } = await dbQuery

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to clear checked items: ${error.message}`,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error clearing checked items:', error)
    throw error
  }
})
