import { createSupabaseClient } from '../utils/supabase'
import { readFileSync } from 'fs'
import { join } from 'path'

interface MenuData {
  breakfast: string[]
  lunch: string[]
  dinner: string[]
}

export default defineEventHandler(async () => {
  try {
    const menuPath = join(process.cwd(), 'public/menu.json')
    const menuData: MenuData = JSON.parse(readFileSync(menuPath, 'utf-8'))
    
    const supabase = createSupabaseClient()
    const dishes = []

    for (const category of ['breakfast', 'lunch', 'dinner'] as const) {
      for (const name of menuData[category]) {
        dishes.push({ name, category })
      }
    }

    let inserted = 0
    let skipped = 0

    for (const dish of dishes) {
      const { error } = await supabase
        .from('dishes')
        .insert(dish)
        .select()
      
      if (error) {
        if (error.code === '23505') {
          skipped++
        } else {
          console.error(`Error inserting dish ${dish.name}:`, error)
          skipped++
        }
      } else {
        inserted++
      }
    }

    const data = { inserted, skipped, total: dishes.length }

    return {
      success: true,
      message: `Migrated ${inserted} dishes to Supabase (${skipped} already existed)`,
      data
    }
  } catch (error) {
    console.error('Error migrating menu:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to migrate menu'
    })
  }
})
