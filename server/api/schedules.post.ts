import { createSupabaseClient } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { week_start, menu_data } = body

    if (!week_start || !menu_data) {
      throw createError({
        statusCode: 400,
        message: 'week_start and menu_data are required'
      })
    }

    const supabase = createSupabaseClient()

    const { data: existing } = await supabase
      .from('schedules')
      .select('id')
      .eq('week_start', week_start)
      .single()

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('schedules')
        .update({ menu_data })
        .eq('week_start', week_start)
        .select()
        .single()

      if (error) {
        throw createError({
          statusCode: 500,
          message: `Failed to update schedule: ${error.message}`
        })
      }
      result = data
    } else {
      const { data, error } = await supabase
        .from('schedules')
        .insert({ week_start, menu_data })
        .select()
        .single()

      if (error) {
        throw createError({
          statusCode: 500,
          message: `Failed to create schedule: ${error.message}`
        })
      }
      result = data
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Error saving schedule:', error)
    throw error
  }
})
