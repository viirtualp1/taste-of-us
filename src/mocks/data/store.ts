import type { MenuCategory } from '@/entities/menu'
import type { CommonItem, ShoppingListItem } from '@/entities/shopping-list'
import { MOCK_TELEGRAM_USER } from './constants'
import { createSeedData } from './seed'

type UserSettings = ReturnType<typeof createSeedData>['settings']

interface DishRecord {
  id: string
  name: string
  category: MenuCategory
  cuisine?: string | null
}

interface IngredientRecord {
  id: string
  dish_id: string
  name: string
  quantity: string | null
}

interface ScheduleRecord {
  id: string
  week_start: string
  menu_data: Array<{
    brunch: string
    dinner: string
    dessert: string
    cook_day?: string
    cook_brunch?: string
    cook_dinner?: string
    cook_dessert?: string
  }>
  created_at: string
  updated_at: string
}

function createId() {
  return crypto.randomUUID()
}

function nowIso() {
  return new Date().toISOString()
}

const state = createSeedData()

let messageIdCounter = 1000

function requireAuth(telegramUserId: string | null) {
  if (!telegramUserId) {
    return {
      ok: false as const,
      response: {
        statusCode: 401,
        message: 'Unauthorized. Please log in via Telegram.',
      },
    }
  }
  return { ok: true as const }
}

export const mockStore = {
  getTelegramUserIdFromHeaders(headers?: HeadersInit | Record<string, string>) {
    if (!headers) return null

    if (headers instanceof Headers) {
      return (
        headers.get('X-Telegram-User-Id') || headers.get('x-telegram-user-id')
      )
    }

    if (Array.isArray(headers)) {
      const entry = headers.find(
        ([key]) => key.toLowerCase() === 'x-telegram-user-id',
      )
      return entry?.[1] ?? null
    }

    return (
      headers['X-Telegram-User-Id'] || headers['x-telegram-user-id'] || null
    )
  },

  getTelegramUserId(request: Request) {
    return this.getTelegramUserIdFromHeaders(request.headers)
  },

  authTelegram() {
    return {
      success: true,
      user: { ...MOCK_TELEGRAM_USER },
    }
  },

  getSettings(telegramUserId: string | null) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth
    return { ok: true as const, data: { ...state.settings } }
  },

  saveSettings(
    telegramUserId: string | null,
    body: Partial<UserSettings> & {
      telegram_chat_id?: string | null
      second_member_telegram_chat_id?: string | null
    },
  ) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const recipient = (body.telegram_chat_id ?? '').trim() || ''
    const secondMember = (body.second_member_telegram_chat_id ?? '').trim() || ''
    const requestedRotationMode = body.cook_rotation_mode ?? state.settings.cook_rotation_mode
    const rotationMode =
      requestedRotationMode !== 'none' && !secondMember
        ? 'none'
        : requestedRotationMode

    state.settings = {
      telegram_chat_id: recipient,
      second_member_telegram_chat_id: secondMember,
      cook_rotation_mode: rotationMode,
      cook_rotation_first: body.cook_rotation_first ?? state.settings.cook_rotation_first,
    }

    return {
      ok: true as const,
      data: {
        success: true,
        settings: { ...state.settings },
      },
    }
  },

  getSchedules(weekStart?: string | null) {
    const schedules = weekStart
      ? state.schedules.filter((s) => s.week_start === weekStart)
      : [...state.schedules]
    return { ok: true as const, data: schedules }
  },

  saveSchedule(body: { week_start?: string; menu_data?: unknown }) {
    if (!body.week_start || !body.menu_data) {
      return {
        ok: false as const,
        response: {
          statusCode: 400,
          message: 'week_start and menu_data are required',
        },
      }
    }

    const existing = state.schedules.find((s) => s.week_start === body.week_start)
    const timestamp = nowIso()

    if (existing) {
      existing.menu_data = body.menu_data as ScheduleRecord['menu_data']
      existing.updated_at = timestamp
      return { ok: true as const, data: { success: true, data: existing } }
    }

    const schedule: ScheduleRecord = {
      id: createId(),
      week_start: body.week_start,
      menu_data: body.menu_data as ScheduleRecord['menu_data'],
      created_at: timestamp,
      updated_at: timestamp,
    }
    state.schedules.push(schedule)
    return { ok: true as const, data: { success: true, data: schedule } }
  },

  getUserDishes(telegramUserId: string | null) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const grouped = {
      brunch: [] as DishRecord[],
      dinner: [] as DishRecord[],
      dessert: [] as DishRecord[],
    }

    for (const dish of state.dishes) {
      grouped[dish.category].push(dish)
    }

    return { ok: true as const, data: grouped }
  },

  createDish(
    telegramUserId: string | null,
    body: { name?: string; category?: string; cuisine?: string | null },
  ) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    if (!body.name || !body.category) {
      return {
        ok: false as const,
        response: { statusCode: 400, message: 'Name and category are required' },
      }
    }

    if (!['brunch', 'dinner', 'dessert'].includes(body.category)) {
      return {
        ok: false as const,
        response: {
          statusCode: 400,
          message: 'Category must be brunch, dinner, or dessert',
        },
      }
    }

    const duplicate = state.dishes.find(
      (d) =>
        d.name.toLowerCase() === body.name!.trim().toLowerCase() &&
        d.category === body.category,
    )
    if (duplicate) {
      return {
        ok: false as const,
        response: {
          statusCode: 400,
          message: 'A dish with this name already exists in this category',
        },
      }
    }

    const dish: DishRecord = {
      id: createId(),
      name: body.name.trim(),
      category: body.category as MenuCategory,
      cuisine: body.cuisine ?? null,
    }
    state.dishes.push(dish)
    return { ok: true as const, data: { success: true, data: dish } }
  },

  updateDish(
    telegramUserId: string | null,
    dishId: string,
    body: { name?: string; category?: string; cuisine?: string | null },
  ) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const dish = state.dishes.find((d) => d.id === dishId)
    if (!dish) {
      return { ok: false as const, response: { statusCode: 404, message: 'Dish not found' } }
    }

    if (body.name) dish.name = body.name.trim()
    if (body.category) dish.category = body.category as MenuCategory
    if (body.cuisine !== undefined) dish.cuisine = body.cuisine

    return { ok: true as const, data: { success: true, data: dish } }
  },

  deleteDish(telegramUserId: string | null, dishId: string) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const index = state.dishes.findIndex((d) => d.id === dishId)
    if (index === -1) {
      return { ok: false as const, response: { statusCode: 404, message: 'Dish not found' } }
    }

    state.dishes.splice(index, 1)
    state.ingredients = state.ingredients.filter((i) => i.dish_id !== dishId)
    return { ok: true as const, data: { success: true } }
  },

  getDishIngredients(telegramUserId: string | null, dishId: string) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const dish = state.dishes.find((d) => d.id === dishId)
    if (!dish) {
      return { ok: false as const, response: { statusCode: 404, message: 'Dish not found' } }
    }

    return {
      ok: true as const,
      data: state.ingredients
        .filter((i) => i.dish_id === dishId)
        .map(({ id, name, quantity }) => ({ id, name, quantity })),
    }
  },

  addDishIngredient(
    telegramUserId: string | null,
    dishId: string,
    body: { name?: string; quantity?: string | null },
  ) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const dish = state.dishes.find((d) => d.id === dishId)
    if (!dish) {
      return { ok: false as const, response: { statusCode: 404, message: 'Dish not found' } }
    }

    if (!body.name?.trim()) {
      return {
        ok: false as const,
        response: { statusCode: 400, message: 'Ingredient name is required' },
      }
    }

    const ingredient: IngredientRecord = {
      id: createId(),
      dish_id: dishId,
      name: body.name.trim(),
      quantity: body.quantity?.trim() || null,
    }
    state.ingredients.push(ingredient)
    return { ok: true as const, data: { success: true, data: ingredient } }
  },

  deleteIngredient(telegramUserId: string | null, ingredientId: string) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const index = state.ingredients.findIndex((i) => i.id === ingredientId)
    if (index === -1) {
      return {
        ok: false as const,
        response: { statusCode: 404, message: 'Ingredient not found' },
      }
    }

    state.ingredients.splice(index, 1)
    return { ok: true as const, data: { success: true } }
  },

  getIngredientsByDishIds(
    telegramUserId: string | null,
    dishIds: string[],
  ) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    if (!dishIds.length) {
      return { ok: true as const, data: {} }
    }

    const validIds = new Set(
      state.dishes.filter((d) => dishIds.includes(d.id)).map((d) => d.id),
    )
    const grouped: Record<string, Array<{ id: string; name: string; quantity: string | null }>> =
      {}

    for (const ing of state.ingredients) {
      if (!validIds.has(ing.dish_id)) continue
      if (!grouped[ing.dish_id]) grouped[ing.dish_id] = []
      grouped[ing.dish_id].push({
        id: ing.id,
        name: ing.name,
        quantity: ing.quantity,
      })
    }

    return { ok: true as const, data: grouped }
  },

  getShoppingList(telegramUserId: string | null, weekStart?: string | null) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const items = weekStart
      ? state.shoppingList.filter((item) => item.week_start === weekStart)
      : [...state.shoppingList]

    return { ok: true as const, data: items }
  },

  addShoppingItem(
    telegramUserId: string | null,
    body: {
      name?: string
      quantity?: string | null
      source_type?: string
      source_dish_id?: string | null
      week_start?: string | null
    },
  ) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    if (!body.name?.trim()) {
      return {
        ok: false as const,
        response: { statusCode: 400, message: 'Item name is required' },
      }
    }

    const sourceType =
      body.source_type === 'dish' ||
      body.source_type === 'common' ||
      body.source_type === 'manual'
        ? body.source_type
        : 'manual'

    const dish = body.source_dish_id
      ? state.dishes.find((d) => d.id === body.source_dish_id)
      : null

    const item: ShoppingListItem & { created_at: string } = {
      id: createId(),
      name: body.name.trim(),
      quantity: body.quantity?.trim() || null,
      is_checked: false,
      source_type: sourceType,
      source_dish_id: body.source_dish_id || null,
      source_dish_name: dish?.name ?? null,
      week_start: body.week_start || null,
      created_at: nowIso(),
    }

    state.shoppingList.push(item)
    return { ok: true as const, data: { success: true, data: item } }
  },

  patchShoppingItem(
    telegramUserId: string | null,
    itemId: string,
    body: { is_checked?: boolean },
  ) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const item = state.shoppingList.find((i) => i.id === itemId)
    if (!item) {
      return {
        ok: false as const,
        response: { statusCode: 404, message: 'Item not found' },
      }
    }

    if (typeof body.is_checked === 'boolean') {
      item.is_checked = body.is_checked
    }

    return { ok: true as const, data: { success: true, data: item } }
  },

  deleteShoppingItem(telegramUserId: string | null, itemId: string) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const index = state.shoppingList.findIndex((i) => i.id === itemId)
    if (index === -1) {
      return {
        ok: false as const,
        response: { statusCode: 404, message: 'Item not found' },
      }
    }

    state.shoppingList.splice(index, 1)
    return { ok: true as const, data: { success: true } }
  },

  generateShoppingList(telegramUserId: string | null, weekStart: string) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const schedule = state.schedules.find((s) => s.week_start === weekStart)
    if (!schedule) {
      return {
        ok: true as const,
        data: { success: true, added: 0, message: 'No menu found for this week' },
      }
    }

    const dishNames = new Set<string>()
    for (const day of schedule.menu_data) {
      if (day.brunch) dishNames.add(day.brunch)
      if (day.dinner) dishNames.add(day.dinner)
      if (day.dessert) dishNames.add(day.dessert)
    }

    if (dishNames.size === 0) {
      return {
        ok: true as const,
        data: { success: true, added: 0, message: 'No dishes in menu' },
      }
    }

    const dishes = state.dishes.filter((d) => dishNames.has(d.name))
    if (!dishes.length) {
      return {
        ok: true as const,
        data: { success: true, added: 0, message: 'No matching dishes found' },
      }
    }

    const dishIds = new Set(dishes.map((d) => d.id))
    const ingredients = state.ingredients.filter((i) => dishIds.has(i.dish_id))

    if (!ingredients.length) {
      return {
        ok: true as const,
        data: { success: true, added: 0, message: 'No ingredients found for dishes' },
      }
    }

    const aggregated = new Map<
      string,
      { name: string; quantities: string[]; dishId: string }
    >()

    for (const ing of ingredients) {
      const key = ing.name.toLowerCase().trim()
      if (!aggregated.has(key)) {
        aggregated.set(key, {
          name: ing.name,
          quantities: [],
          dishId: ing.dish_id,
        })
      }
      const entry = aggregated.get(key)!
      if (ing.quantity) entry.quantities.push(ing.quantity)
    }

    let added = 0
    for (const entry of aggregated.values()) {
      const quantity =
        entry.quantities.length === 0
          ? null
          : entry.quantities.length === 1
            ? entry.quantities[0]
            : entry.quantities.join(' + ')

      state.shoppingList.push({
        id: createId(),
        name: entry.name,
        quantity,
        is_checked: false,
        source_type: 'dish',
        source_dish_id: entry.dishId,
        source_dish_name:
          state.dishes.find((d) => d.id === entry.dishId)?.name ?? null,
        week_start: weekStart,
      })
      added++
    }

    return {
      ok: true as const,
      data: {
        success: true,
        added,
        message: `Added ${added} items from menu`,
      },
    }
  },

  getCommonItems(telegramUserId: string | null) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth
    return { ok: true as const, data: [...state.commonItems] }
  },

  addCommonItem(
    telegramUserId: string | null,
    body: { name?: string; default_quantity?: string | null },
  ) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    if (!body.name?.trim()) {
      return {
        ok: false as const,
        response: { statusCode: 400, message: 'Item name is required' },
      }
    }

    const item: CommonItem = {
      id: createId(),
      name: body.name.trim(),
      default_quantity: body.default_quantity?.trim() || null,
    }
    state.commonItems.push(item)
    return { ok: true as const, data: { success: true, data: item } }
  },

  deleteCommonItem(telegramUserId: string | null, itemId: string) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    const index = state.commonItems.findIndex((i) => i.id === itemId)
    if (index === -1) {
      return {
        ok: false as const,
        response: { statusCode: 404, message: 'Common item not found' },
      }
    }

    state.commonItems.splice(index, 1)
    return { ok: true as const, data: { success: true } }
  },

  sendMenu(telegramUserId: string | null) {
    const auth = requireAuth(telegramUserId)
    if (!auth.ok) return auth

    if (!state.settings.telegram_chat_id.trim()) {
      return {
        ok: false as const,
        response: {
          statusCode: 400,
          message:
            'Set recipient Telegram Chat ID in Profile settings to send the menu.',
        },
      }
    }

    messageIdCounter += 1
    state.telegramMessages.push({
      chat_id: state.settings.telegram_chat_id,
      text: 'Weekly menu (mock)',
      message_id: messageIdCounter,
      method: 'sendMessage',
    })

    return {
      ok: true as const,
      data: {
        success: true,
        message: 'Menu sent successfully',
        pinned: true,
      },
    }
  },

  recordTelegramApiCall(
    method: string,
    body: Record<string, unknown>,
  ): { ok: boolean; result?: Record<string, unknown>; description?: string } {
    const chatId = String(body.chat_id ?? '')
    if (!chatId) {
      return { ok: false, description: 'Bad Request: chat_id is required' }
    }

    messageIdCounter += 1
    const messageId = messageIdCounter

    state.telegramMessages.push({
      chat_id: chatId,
      text: String(body.text ?? body.caption ?? `[${method}]`),
      message_id: messageId,
      method,
    })

    return {
      ok: true,
      result: {
        message_id: messageId,
        chat: { id: Number(chatId) || chatId, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: String(body.text ?? ''),
      },
    }
  },

  getMenuCatalog() {
    return {
      brunch: state.dishes
        .filter((d) => d.category === 'brunch')
        .map((d) => d.name),
      dinner: state.dishes
        .filter((d) => d.category === 'dinner')
        .map((d) => d.name),
      dessert: state.dishes
        .filter((d) => d.category === 'dessert')
        .map((d) => d.name),
    }
  },

  getAllDishes() {
    return state.dishes.map(({ id, name, category, cuisine }) => ({
      id,
      name,
      category,
      cuisine,
    }))
  },
}
