import { createSupabaseClient } from '../../utils/supabase'

function getStartOfWeek(date: Date): Date {
  const copy = new Date(date)
  const day = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const expectedToken = config.cronSecretToken

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    throw createError({
      statusCode: 401,
      message:
        'Unauthorized. Please provide valid CRON_SECRET_TOKEN in Authorization header.',
    })
  }

  try {
    const supabase = createSupabaseClient()
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7

    if (dayOfWeek !== 0) {
      return {
        success: true,
        message: 'Not Monday, skipping cleanup',
        dayOfWeek,
      }
    }

    const previousWeekStart = getStartOfWeek(new Date(today))
    previousWeekStart.setDate(previousWeekStart.getDate() - 7)
    const previousWeekStartString = previousWeekStart.toISOString().split('T')[0]

    const { data: users, error: usersError } = await supabase
      .from('telegram_users')
      .select('user_id')

    if (usersError) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch users: ${usersError.message}`,
      })
    }

    if (!users || users.length === 0) {
      return { success: true, message: 'No users found', cleaned: 0 }
    }

    let cleanedCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        const { error: deleteError } = await supabase
          .from('shopping_list_items')
          .delete()
          .eq('user_id', user.user_id)
          .eq('week_start', previousWeekStartString)
          .eq('is_checked', true)

        if (deleteError) {
          console.error(
            `Error cleaning checked items for user ${user.user_id}:`,
            deleteError,
          )
          errorCount++
        } else {
          cleanedCount++
        }
      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error)
        errorCount++
      }
    }

    return {
      success: true,
      cleaned: cleanedCount,
      errors: errorCount,
      total: users.length,
      previousWeekStart: previousWeekStartString,
    }
  } catch (error) {
    console.error('Error in Monday cleanup:', error)
    throw error
  }
})
