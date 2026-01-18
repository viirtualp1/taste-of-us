import { createSupabaseClient } from '../../utils/supabase'
import type { Dish, MenuCategory } from '@/utils/menu'

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized. Please log in.',
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid or expired token. Please log in again.',
      })
    }

    const { data, error } = await supabase
      .from('user_dishes')
      .select('id, name, category, cuisine')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch user dishes: ${error.message}`,
      })
    }

    const grouped: Record<MenuCategory, Dish[]> = {
      brunch: [],
      dinner: [],
      dessert: [],
    }

    data?.forEach((dish) => {
      if (dish.category in grouped) {
        grouped[dish.category as MenuCategory].push(dish as Dish)
      }
    })

    return grouped
  } catch (error) {
    console.error('Error fetching user dishes:', error)
    throw error
  }
})
