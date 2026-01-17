import { createSupabaseClient } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = createSupabaseClient()
    const weekStart = getQuery(event).week_start as string | undefined

    let query = supabase
      .from('schedules')
      .select('*')
      .order('week_start', { ascending: false })

    if (weekStart) {
      query = query.eq('week_start', weekStart)
    }

    const { data, error } = await query

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch schedules: ${error.message}`,
      })
    }

    return data || []
  } catch (error) {
    console.error('Error fetching schedules:', error)
    throw error
  }
})
