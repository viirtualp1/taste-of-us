export function escapeRichHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export interface TelegramApiResponse {
  ok: boolean
  result?: {
    message_id?: number
    [key: string]: unknown
  }
  description?: string
  error_code?: number
}

export class TelegramApiError extends Error {
  constructor(
    message: string,
    readonly errorCode?: number,
  ) {
    super(message)
    this.name = 'TelegramApiError'
  }
}

async function callTelegramApi(
  token: string,
  method: string,
  body: Record<string, unknown>,
): Promise<TelegramApiResponse> {
  const url = `https://api.telegram.org/bot${token}/${method}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const responseText = await response.text()
  let payload: TelegramApiResponse

  try {
    payload = JSON.parse(responseText) as TelegramApiResponse
  } catch {
    throw new TelegramApiError(
      `Telegram API error: ${responseText}`,
      response.status,
    )
  }

  if (!response.ok || !payload.ok) {
    const description = payload.description || responseText
    throw new TelegramApiError(
      `Telegram API error: ${description}`,
      payload.error_code,
    )
  }

  return payload
}

export async function sendRichMessage(
  token: string,
  chatId: string,
  html: string,
  options?: {
    replyMarkup?: Record<string, unknown>
    skipEntityDetection?: boolean
  },
): Promise<TelegramApiResponse> {
  return callTelegramApi(token, 'sendRichMessage', {
    chat_id: chatId,
    rich_message: {
      html,
      skip_entity_detection: options?.skipEntityDetection ?? true,
    },
    ...(options?.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
  })
}

export async function sendPlainMessage(
  token: string,
  chatId: string,
  text: string,
  parseMode: 'Markdown' | 'MarkdownV2' | 'HTML' = 'Markdown',
): Promise<TelegramApiResponse> {
  return callTelegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  })
}

export async function pinChatMessage(
  token: string,
  chatId: string,
  messageId: number,
): Promise<TelegramApiResponse> {
  return callTelegramApi(token, 'pinChatMessage', {
    chat_id: chatId,
    message_id: messageId,
    disable_notification: false,
  })
}

export function isTelegramDeliveryError(message: string): boolean {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('chat not found') ||
    normalized.includes('bot was blocked') ||
    normalized.includes('user is deactivated') ||
    normalized.includes('forbidden')
  )
}

export function isRichMessageUnsupported(error: unknown): boolean {
  if (!(error instanceof TelegramApiError)) return false

  const message = error.message.toLowerCase()
  return (
    (message.includes('method') && message.includes('not found')) ||
    message.includes('sendrichmessage') ||
    error.errorCode === 404
  )
}

type CookSlot = 'me' | 'partner'

interface MenuDayMeals {
  brunch: string
  dinner: string
  dessert: string
}

export interface MenuDayForTelegram {
  day: string
  date: string
  meals: MenuDayMeals
  _cook?: { brunch?: CookSlot; dinner?: CookSlot; dessert?: CookSlot }
}

export interface ResponsibleItem {
  day: string
  meal: string
  dish: string
}

const MEAL_COLUMNS = [
  { key: 'brunch' as const, label: '🌅 Brunch' },
  { key: 'dinner' as const, label: '🌙 Dinner' },
  { key: 'dessert' as const, label: '🍰 Dessert' },
]

function formatShortDate(isoDate: string): string {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function formatMealCell(name: string, cook?: CookSlot): string {
  if (!name) return '<i>—</i>'

  const escaped = escapeRichHtml(name)
  if (!cook) return escaped

  return `${escaped}<br/><i>👤 ${escapeRichHtml(cook)}</i>`
}

function formatMealLabel(meal: string): string {
  if (meal === 'whole day') return 'Whole day'
  return meal.charAt(0).toUpperCase() + meal.slice(1)
}

export function formatMenuRichHtml(menu: MenuDayForTelegram[]): string {
  const firstDay = menu[0]
  const lastDay = menu[menu.length - 1]
  const weekLabel =
    firstDay && lastDay
      ? `${formatShortDate(firstDay.date)} – ${formatShortDate(lastDay.date)}`
      : ''

  const headerCells = MEAL_COLUMNS.map(
    (column) => `<th>${column.label}</th>`,
  ).join('')

  const rows = menu
    .map((day) => {
      const cook = day._cook
      const dateLabel = formatShortDate(day.date)
      const dayCell = dateLabel
        ? `<b>${escapeRichHtml(day.day)}</b><br/><i>${escapeRichHtml(dateLabel)}</i>`
        : `<b>${escapeRichHtml(day.day)}</b>`

      const mealCells = MEAL_COLUMNS.map((column) => {
        const name = day.meals[column.key]
        return `<td>${formatMealCell(name, cook?.[column.key])}</td>`
      }).join('')

      return `<tr><td>${dayCell}</td>${mealCells}</tr>`
    })
    .join('')

  return [
    '<h1>🍽 Weekly Menu Plan</h1>',
    '<table>',
    weekLabel ? `<caption>${escapeRichHtml(weekLabel)}</caption>` : '',
    `<tr><th>Day</th>${headerCells}</tr>`,
    rows,
    '</table>',
    '<footer>Planned with Taste of Us</footer>',
  ]
    .filter(Boolean)
    .join('\n')
}

export function formatMenuPlainText(menu: MenuDayForTelegram[]): string {
  let text = '🍽️ *Weekly Menu Plan*\n\n'

  menu.forEach((day) => {
    text += `📅 *${day.day}*\n`
    const cook = day._cook
    if (day.meals.brunch) {
      text += `🌅 Brunch: ${day.meals.brunch}${cook?.brunch ? ` 👤 ${cook.brunch}` : ''}\n`
    }
    if (day.meals.dinner) {
      text += `🌙 Dinner: ${day.meals.dinner}${cook?.dinner ? ` 👤 ${cook.dinner}` : ''}\n`
    }
    if (day.meals.dessert) {
      text += `🍰 Dessert: ${day.meals.dessert}${cook?.dessert ? ` 👤 ${cook.dessert}` : ''}\n`
    }
    if (!day.meals.brunch && !day.meals.dinner && !day.meals.dessert) {
      text += '_No meals planned_\n'
    }
    text += '\n'
  })

  return text
}

export function formatResponsibleRichHtml(items: ResponsibleItem[]): string {
  if (items.length === 0) return ''

  const rows = items
    .map(
      (item) =>
        `<tr><td>${escapeRichHtml(item.day)}</td><td>${escapeRichHtml(formatMealLabel(item.meal))}</td><td>${escapeRichHtml(item.dish)}</td></tr>`,
    )
    .join('')

  return [
    '<h2>👨‍🍳 You\'re responsible for cooking</h2>',
    '<table>',
    '<tr><th>Day</th><th>Meal</th><th>Dish</th></tr>',
    rows,
    '</table>',
  ].join('\n')
}

export function formatResponsiblePlainText(items: ResponsibleItem[]): string {
  let text = `👨‍🍳 *You're responsible for cooking:*\n\n`
  items.forEach((item) => {
    text += `• ${item.day} — ${item.meal}: ${item.dish}\n`
  })
  return text
}

export async function sendMenuMessage(
  token: string,
  chatId: string,
  menu: MenuDayForTelegram[],
): Promise<TelegramApiResponse> {
  const richHtml = formatMenuRichHtml(menu)

  try {
    return await sendRichMessage(token, chatId, richHtml)
  } catch (error) {
    if (!isRichMessageUnsupported(error)) throw error
    return sendPlainMessage(token, chatId, formatMenuPlainText(menu))
  }
}

export async function sendResponsibleMessage(
  token: string,
  chatId: string,
  items: ResponsibleItem[],
): Promise<boolean> {
  if (items.length === 0) return true

  try {
    await sendRichMessage(token, chatId, formatResponsibleRichHtml(items))
    return true
  } catch (error) {
    if (!isRichMessageUnsupported(error)) return false
    try {
      await sendPlainMessage(
        token,
        chatId,
        formatResponsiblePlainText(items),
      )
      return true
    } catch {
      return false
    }
  }
}
