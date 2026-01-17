import { createSupabaseClient } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, category, cuisine } = body

    if (!name || !category) {
      throw createError({
        statusCode: 400,
        message: 'Name and category are required',
      })
    }

    if (!['brunch', 'dinner'].includes(category)) {
      throw createError({
        statusCode: 400,
        message: 'Category must be brunch or dinner',
      })
    }

    if (cuisine && !['asian', 'european', 'slavic'].includes(cuisine)) {
      throw createError({
        statusCode: 400,
        message: 'Cuisine must be asian, european, or slavic',
      })
    }

    const supabase = createSupabaseClient()
    const insertData: { name: string; category: string; cuisine?: string } = {
      name,
      category,
    }

    if (cuisine) {
      insertData.cuisine = cuisine
    }

    const { data, error } = await supabase
      .from('dishes')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to create dish: ${error.message}`,
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error creating dish:', error)
    throw error
  }
})
