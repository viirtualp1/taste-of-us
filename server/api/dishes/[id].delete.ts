import { createSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Dish ID is required'
      })
    }

    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to delete dish: ${error.message}`
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting dish:', error)
    throw error
  }
})
