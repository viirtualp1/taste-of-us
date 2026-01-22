import { getUserIdFromTelegram } from '../../utils/auth'
import { createSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const userId = await getUserIdFromTelegram(event)

    if (!userId) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized. Please log in via Telegram.',
      })
    }

    const body = await readBody(event)
    const { dish_ids } = body

    if (!dish_ids || !Array.isArray(dish_ids) || dish_ids.length === 0) {
      return []
    }

    const supabase = createSupabaseClient()

    const { data: dishes, error: dishesError } = await supabase
      .from('user_dishes')
      .select('id')
      .eq('user_id', userId)
      .in('id', dish_ids)

    if (dishesError) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch dishes: ${dishesError.message}`,
      })
    }

    if (!dishes || dishes.length === 0) {
      return []
    }

    const validDishIds = dishes.map((d) => d.id)

    const { data: ingredients, error: ingredientsError } = await supabase
      .from('dish_ingredients')
      .select('id, dish_id, name, quantity')
      .in('dish_id', validDishIds)
      .order('created_at', { ascending: true })

    if (ingredientsError) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch ingredients: ${ingredientsError.message}`,
      })
    }

    const grouped = new Map<
      string,
      Array<{ id: string; name: string; quantity: string | null }>
    >()

    ingredients?.forEach((ing) => {
      if (!grouped.has(ing.dish_id)) {
        grouped.set(ing.dish_id, [])
      }
      grouped.get(ing.dish_id)!.push({
        id: ing.id,
        name: ing.name,
        quantity: ing.quantity,
      })
    })

    return Object.fromEntries(grouped)
  } catch (error) {
    console.error('Error fetching dish ingredients:', error)
    throw error
  }
})
