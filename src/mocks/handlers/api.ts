import { http, HttpResponse } from 'msw'
import { mockStore } from '../data/store'

function errorResponse(statusCode: number, message: string) {
  return HttpResponse.json({ statusCode, message }, { status: statusCode })
}

async function readJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T
}

export const apiHandlers = [
  http.post('*/api/auth/telegram', async () => {
    return HttpResponse.json(mockStore.authTelegram())
  }),

  http.get('*/api/user/settings', ({ request }) => {
    const result = mockStore.getSettings(mockStore.getTelegramUserId(request))
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.post('*/api/user/settings', async ({ request }) => {
    const body = await readJsonBody<Record<string, unknown>>(request)
    const result = mockStore.saveSettings(mockStore.getTelegramUserId(request), body)
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.get('*/api/schedules', ({ request }) => {
    const url = new URL(request.url)
    const weekStart = url.searchParams.get('week_start')
    const result = mockStore.getSchedules(weekStart)
    return HttpResponse.json(result.data)
  }),

  http.post('*/api/schedules', async ({ request }) => {
    const body = await readJsonBody<{ week_start?: string; menu_data?: unknown }>(request)
    const result = mockStore.saveSchedule(body)
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.get('*/api/user/dishes', ({ request }) => {
    const result = mockStore.getUserDishes(mockStore.getTelegramUserId(request))
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.post('*/api/user/dishes', async ({ request }) => {
    const body = await readJsonBody<{
      name?: string
      category?: string
      cuisine?: string | null
    }>(request)
    const result = mockStore.createDish(mockStore.getTelegramUserId(request), body)
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.put('*/api/user/dishes/:id', async ({ params, request }) => {
    const body = await readJsonBody<{
      name?: string
      category?: string
      cuisine?: string | null
    }>(request)
    const result = mockStore.updateDish(
      mockStore.getTelegramUserId(request),
      String(params.id),
      body,
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.delete('*/api/user/dishes/:id', ({ params, request }) => {
    const result = mockStore.deleteDish(
      mockStore.getTelegramUserId(request),
      String(params.id),
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.get('*/api/user/dishes/:id/ingredients', ({ params, request }) => {
    const result = mockStore.getDishIngredients(
      mockStore.getTelegramUserId(request),
      String(params.id),
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.post('*/api/user/dishes/:id/ingredients', async ({ params, request }) => {
    const body = await readJsonBody<{ name?: string; quantity?: string | null }>(request)
    const result = mockStore.addDishIngredient(
      mockStore.getTelegramUserId(request),
      String(params.id),
      body,
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.delete('*/api/user/ingredients/:id', ({ params, request }) => {
    const result = mockStore.deleteIngredient(
      mockStore.getTelegramUserId(request),
      String(params.id),
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.post('*/api/dishes/ingredients', async ({ request }) => {
    const body = await readJsonBody<{ dish_ids?: string[] }>(request)
    const result = mockStore.getIngredientsByDishIds(
      mockStore.getTelegramUserId(request),
      body.dish_ids ?? [],
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.get('*/api/shopping-list', ({ request }) => {
    const url = new URL(request.url)
    const weekStart = url.searchParams.get('week_start')
    const result = mockStore.getShoppingList(
      mockStore.getTelegramUserId(request),
      weekStart,
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.post('*/api/shopping-list/generate', async ({ request }) => {
    const body = await readJsonBody<{ week_start?: string }>(request)
    if (!body.week_start) {
      return errorResponse(400, 'week_start is required')
    }
    const result = mockStore.generateShoppingList(
      mockStore.getTelegramUserId(request),
      body.week_start,
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.post('*/api/shopping-list', async ({ request }) => {
    const body = await readJsonBody<{
      name?: string
      quantity?: string | null
      source_type?: string
      source_dish_id?: string | null
      week_start?: string | null
    }>(request)
    const result = mockStore.addShoppingItem(mockStore.getTelegramUserId(request), body)
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.patch('*/api/shopping-list/:id', async ({ params, request }) => {
    const body = await readJsonBody<{ is_checked?: boolean }>(request)
    const result = mockStore.patchShoppingItem(
      mockStore.getTelegramUserId(request),
      String(params.id),
      body,
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.delete('*/api/shopping-list/:id', ({ params, request }) => {
    const result = mockStore.deleteShoppingItem(
      mockStore.getTelegramUserId(request),
      String(params.id),
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.delete('*/api/shopping-list/clear-checked', ({ request }) => {
    const telegramUserId = mockStore.getTelegramUserId(request)
    if (!telegramUserId) {
      return errorResponse(401, 'Unauthorized. Please log in via Telegram.')
    }
    return HttpResponse.json({ success: true, deleted: 0 })
  }),

  http.get('*/api/common-items', ({ request }) => {
    const result = mockStore.getCommonItems(mockStore.getTelegramUserId(request))
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.post('*/api/common-items', async ({ request }) => {
    const body = await readJsonBody<{
      name?: string
      default_quantity?: string | null
    }>(request)
    const result = mockStore.addCommonItem(mockStore.getTelegramUserId(request), body)
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.delete('*/api/common-items/:id', ({ params, request }) => {
    const result = mockStore.deleteCommonItem(
      mockStore.getTelegramUserId(request),
      String(params.id),
    )
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.post('*/api/common-items/add-to-list', async () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('*/api/send-menu', ({ request }) => {
    const result = mockStore.sendMenu(mockStore.getTelegramUserId(request))
    if (!result.ok) return errorResponse(result.response.statusCode, result.response.message)
    return HttpResponse.json(result.data)
  }),

  http.get('*/api/menu', () => {
    return HttpResponse.json(mockStore.getMenuCatalog())
  }),

  http.get('*/api/dishes', () => {
    return HttpResponse.json(mockStore.getMenuCatalog())
  }),

  http.get('*/api/dishes/all', () => {
    return HttpResponse.json(mockStore.getAllDishes())
  }),

  http.get('*/api/telegram/webhook', () => {
    return HttpResponse.json({ message: 'Telegram webhook endpoint is active' })
  }),

  http.post('*/api/telegram/webhook', async () => {
    return HttpResponse.json({ ok: true })
  }),

  http.post('*/api/reminders/monday-cleanup', () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('*/api/reminders/sunday-shopping', () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('*/api/migrate-menu', () => {
    return HttpResponse.json({ success: true })
  }),
]
