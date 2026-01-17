import { createSupabaseClient } from '../../utils/supabase'
import type { Dish } from '@/utils/menu'

export default defineEventHandler(async () => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('dishes')
      .select('id, name, category, cuisine')
      .order('name', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch dishes: ${error.message}`,
      })
    }

    return (data || []) as Dish[]
  } catch (error) {
    console.error('Error fetching dishes:', error)
    throw error
  }
})
