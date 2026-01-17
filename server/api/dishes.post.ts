import { createSupabaseClient } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, category } = body

    if (!name || !category) {
      throw createError({
        statusCode: 400,
        message: 'Name and category are required'
      })
    }

    if (!['breakfast', 'lunch', 'dinner'].includes(category)) {
      throw createError({
        statusCode: 400,
        message: 'Category must be breakfast, lunch, or dinner'
      })
    }

    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('dishes')
      .insert({ name, category })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to create dish: ${error.message}`
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error creating dish:', error)
    throw error
  }
})
