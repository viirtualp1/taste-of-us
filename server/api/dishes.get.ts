import { createSupabaseClient } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = createSupabaseClient()
    const category = getQuery(event).category as string | undefined

    let query = supabase
      .from('dishes')
      .select('*')
      .order('name', { ascending: true })

    if (category && ['breakfast', 'lunch', 'dinner'].includes(category)) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch dishes: ${error.message}`
      })
    }

    const grouped = {
      breakfast: [] as string[],
      lunch: [] as string[],
      dinner: [] as string[]
    }

    data?.forEach((dish) => {
      if (dish.category in grouped) {
        grouped[dish.category as keyof typeof grouped].push(dish.name)
      }
    })

    return grouped
  } catch (error) {
    console.error('Error fetching dishes:', error)
    throw error
  }
})
