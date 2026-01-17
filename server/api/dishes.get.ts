import { createSupabaseClient } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = createSupabaseClient()
    const category = getQuery(event).category as string | undefined

    let query = supabase
      .from('dishes')
      .select('*')
      .in('category', ['brunch', 'dinner', 'breakfast', 'lunch'])
      .order('name', { ascending: true })

    if (category && ['brunch', 'dinner'].includes(category)) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch dishes: ${error.message}`,
      })
    }

    const grouped = {
      brunch: [] as string[],
      dinner: [] as string[],
    }

    const seen = {
      brunch: new Set<string>(),
      dinner: new Set<string>(),
    }

    data?.forEach((dish) => {
      const category =
        dish.category === 'breakfast' || dish.category === 'lunch'
          ? 'brunch'
          : dish.category
      if (category in grouped && category in seen) {
        const categoryKey = category as keyof typeof grouped
        if (!seen[categoryKey].has(dish.name)) {
          seen[categoryKey].add(dish.name)
          grouped[categoryKey].push(dish.name)
        }
      }
    })

    return grouped
  } catch (error) {
    console.error('Error fetching dishes:', error)
    throw error
  }
})
