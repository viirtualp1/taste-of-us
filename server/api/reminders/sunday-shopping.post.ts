import { createSupabaseClient } from '../../utils/supabase'

function getStartOfWeek(date: Date): Date {
  const copy = new Date(date)
  const day = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)
  return copy
}

async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Telegram message send error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        chatId: chatId,
      })
      return false
    }

    return true
  } catch (error) {
    console.error('Error in sendTelegramMessage:', error)
    return false
  }
}

function formatShoppingListForTelegram(items: any[]): string {
  if (items.length === 0) {
    return '📋 *Shopping List for This Week*\n\nYour shopping list is empty. Add items in the app!'
  }

  const uncheckedItems = items.filter((item) => !item.is_checked)
  const checkedItems = items.filter((item) => item.is_checked)

  let message = '📋 *Shopping List for This Week*\n\n'

  if (uncheckedItems.length > 0) {
    message += '*To Buy:*\n'
    uncheckedItems.forEach((item, index) => {
      const quantity = item.quantity ? ` (${item.quantity})` : ''
      message += `${index + 1}. ${item.name}${quantity}\n`
    })
    message += '\n'
  }

  if (checkedItems.length > 0) {
    message += '*Already Purchased:*\n'
    checkedItems.forEach((item) => {
      const quantity = item.quantity ? ` (${item.quantity})` : ''
      message += `✅ ${item.name}${quantity}\n`
    })
  }

  return message
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const telegramBotToken = config.telegramBotToken

  if (!telegramBotToken) {
    throw createError({
      statusCode: 500,
      message: 'Telegram bot token not configured',
    })
  }

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
    const currentWeekStart = getStartOfWeek(new Date())
    const weekStartString = currentWeekStart.toISOString().split('T')[0]

    const { data: users, error: usersError } = await supabase
      .from('telegram_users')
      .select('telegram_id, user_id')

    if (usersError) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch users: ${usersError.message}`,
      })
    }

    if (!users || users.length === 0) {
      return { success: true, message: 'No users found', sent: 0 }
    }

    let sentCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        const { data: items, error: itemsError } = await supabase
          .from('shopping_list_items')
          .select(
            `
            id,
            name,
            quantity,
            is_checked,
            user_dishes(name)
          `,
          )
          .eq('user_id', user.user_id)
          .eq('week_start', weekStartString)
          .order('is_checked', { ascending: true })
          .order('created_at', { ascending: true })

        if (itemsError) {
          console.error(
            `Error fetching shopping list for user ${user.user_id}:`,
            itemsError,
          )
          errorCount++
          continue
        }

        const formattedItems = (items || []).map((item) => ({
          name: item.name,
          quantity: item.quantity,
          is_checked: item.is_checked,
        }))

        const message = formatShoppingListForTelegram(formattedItems)
        const success = await sendTelegramMessage(
          telegramBotToken,
          String(user.telegram_id),
          message,
        )

        if (success) {
          sentCount++
        } else {
          errorCount++
        }
      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error)
        errorCount++
      }
    }

    return {
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: users.length,
    }
  } catch (error) {
    console.error('Error in Sunday shopping reminder:', error)
    throw error
  }
})
