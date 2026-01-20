import { getUserIdFromTelegram } from '../../utils/auth'
import { createSupabaseClient } from '../../utils/supabase'

export interface ShoppingListItem {
  id: string
  name: string
  quantity: string | null
  is_checked: boolean
  source_type: 'dish' | 'manual' | 'common'
  source_dish_id: string | null
  source_dish_name?: string | null
  week_start: string | null
  created_at: string
}

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
      .select(
        `
        id,
        name,
        quantity,
        is_checked,
        source_type,
        source_dish_id,
        week_start,
        created_at,
        user_dishes(name)
      `,
      )
      .eq('user_id', userId)
      .order('is_checked', { ascending: true })
      .order('created_at', { ascending: true })

    if (weekStart) {
      dbQuery = dbQuery.eq('week_start', weekStart)
    }

    const { data, error } = await dbQuery

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch shopping list: ${error.message}`,
      })
    }

    const items: ShoppingListItem[] = (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      is_checked: item.is_checked,
      source_type: item.source_type as 'dish' | 'manual' | 'common',
      source_dish_id: item.source_dish_id,
      source_dish_name:
        (item.user_dishes as { name: string } | null)?.name || null,
      week_start: item.week_start,
      created_at: item.created_at,
    }))

    return items
  } catch (error) {
    console.error('Error fetching shopping list:', error)
    throw error
  }
})
