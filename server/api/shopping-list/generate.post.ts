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
    const { week_start } = body

    if (!week_start) {
      throw createError({
        statusCode: 400,
        message: 'week_start is required',
      })
    }

    const supabase = createSupabaseClient()

    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select('menu_data')
      .eq('week_start', week_start)
      .single()

    if (scheduleError || !schedule) {
      return { success: true, added: 0, message: 'No menu found for this week' }
    }

    const menuData = schedule.menu_data as Array<{
      brunch?: string
      dinner?: string
      dessert?: string
    }>

    const dishNames = new Set<string>()
    menuData.forEach((day) => {
      if (day.brunch) dishNames.add(day.brunch)
      if (day.dinner) dishNames.add(day.dinner)
      if (day.dessert) dishNames.add(day.dessert)
    })

    if (dishNames.size === 0) {
      return { success: true, added: 0, message: 'No dishes in menu' }
    }

    const { data: dishes, error: dishesError } = await supabase
      .from('user_dishes')
      .select('id, name')
      .eq('user_id', userId)
      .in('name', Array.from(dishNames))

    if (dishesError) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch dishes: ${dishesError.message}`,
      })
    }

    if (!dishes || dishes.length === 0) {
      return { success: true, added: 0, message: 'No matching dishes found' }
    }

    const dishIds = dishes.map((d) => d.id)

    const { data: ingredients, error: ingredientsError } = await supabase
      .from('dish_ingredients')
      .select('id, dish_id, name, quantity')
      .in('dish_id', dishIds)

    if (ingredientsError) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch ingredients: ${ingredientsError.message}`,
      })
    }

    if (!ingredients || ingredients.length === 0) {
      return {
        success: true,
        added: 0,
        message: 'No ingredients found for dishes',
      }
    }

    const aggregated = new Map<
      string,
      { name: string; quantities: string[]; dishIds: Set<string> }
    >()

    ingredients.forEach((ing) => {
      const key = ing.name.toLowerCase().trim()
      if (!aggregated.has(key)) {
        aggregated.set(key, {
          name: ing.name,
          quantities: [],
          dishIds: new Set(),
        })
      }
      const entry = aggregated.get(key)!
      if (ing.quantity) entry.quantities.push(ing.quantity)
      entry.dishIds.add(ing.dish_id)
    })

    const itemsToInsert = Array.from(aggregated.values()).map((entry) => {
      const dishId = Array.from(entry.dishIds)[0]
      let quantity: string | null = null
      if (entry.quantities.length === 1) {
        quantity = entry.quantities[0]
      } else if (entry.quantities.length > 1) {
        quantity = entry.quantities.join(' + ')
      }

      return {
        user_id: userId,
        name: entry.name,
        quantity,
        source_type: 'dish',
        source_dish_id: dishId,
        week_start,
        is_checked: false,
      }
    })

    if (itemsToInsert.length === 0) {
      return { success: true, added: 0, message: 'No items to add' }
    }

    const { error: insertError } = await supabase
      .from('shopping_list_items')
      .insert(itemsToInsert)

    if (insertError) {
      throw createError({
        statusCode: 500,
        message: `Failed to add items: ${insertError.message}`,
      })
    }

    return {
      success: true,
      added: itemsToInsert.length,
      message: `Added ${itemsToInsert.length} items from menu`,
    }
  } catch (error) {
    console.error('Error generating shopping list:', error)
    throw error
  }
})
