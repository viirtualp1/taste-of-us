import { MOCK_TELEGRAM_USER } from './data/constants'
import { mockStore } from './data/store'

export interface MockRequestOptions {
  method?: string
  headers?: HeadersInit | Record<string, string>
  body?: unknown
  query?: Record<string, string | number | boolean | undefined | null>
}

export interface MockRequestResult {
  handled: boolean
  data?: unknown
  error?: { status: number; message: string }
}

function normalizePath(url: string) {
  const parsed = url.startsWith('http')
    ? new URL(url)
    : new URL(url, 'http://localhost')

  return {
    pathname: parsed.pathname.replace(/\/$/, '') || '/',
    searchParams: parsed.searchParams,
  }
}

function mergeQuery(
  searchParams: URLSearchParams,
  query?: MockRequestOptions['query'],
) {
  const merged: Record<string, string> = Object.fromEntries(searchParams.entries())

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        merged[key] = String(value)
      }
    }
  }

  return merged
}

function matchPath(pathname: string, pattern: string) {
  const pathParts = pathname.split('/').filter(Boolean)
  const patternParts = pattern.split('/').filter(Boolean)

  if (pathParts.length !== patternParts.length) return null

  const params: Record<string, string> = {}

  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i]
    const segment = pathParts[i]

    if (!part || segment === undefined) return null

    if (part.startsWith(':')) {
      params[part.slice(1)] = segment
      continue
    }

    if (part !== segment) return null
  }

  return params
}

function fail(status: number, message: string): MockRequestResult {
  return { handled: true, error: { status, message } }
}

function ok(data: unknown): MockRequestResult {
  return { handled: true, data }
}

function fromStoreResult(result: {
  ok: boolean
  data?: unknown
  response?: { statusCode: number; message: string }
}): MockRequestResult {
  if (!result.ok) {
    return fail(result.response!.statusCode, result.response!.message)
  }
  return ok(result.data)
}

export async function resolveMockRequest(
  url: string,
  options: MockRequestOptions = {},
): Promise<MockRequestResult> {
  const method = (options.method ?? 'GET').toUpperCase()
  const { pathname, searchParams } = normalizePath(url)
  const query = mergeQuery(searchParams, options.query)
  const telegramUserId =
    mockStore.getTelegramUserIdFromHeaders(options.headers) ??
    String(MOCK_TELEGRAM_USER.id)
  const body = (options.body ?? {}) as Record<string, unknown>

  if (pathname === '/api/auth/telegram' && method === 'POST') {
    return ok(mockStore.authTelegram())
  }

  if (pathname === '/api/user/settings' && method === 'GET') {
    return fromStoreResult(mockStore.getSettings(telegramUserId))
  }

  if (pathname === '/api/user/settings' && method === 'POST') {
    return fromStoreResult(mockStore.saveSettings(telegramUserId, body))
  }

  if (pathname === '/api/schedules' && method === 'GET') {
    return ok(mockStore.getSchedules(query.week_start ?? null).data)
  }

  if (pathname === '/api/schedules' && method === 'POST') {
    return fromStoreResult(
      mockStore.saveSchedule(body as { week_start?: string; menu_data?: unknown }),
    )
  }

  if (pathname === '/api/user/dishes' && method === 'GET') {
    return fromStoreResult(mockStore.getUserDishes(telegramUserId))
  }

  if (pathname === '/api/user/dishes' && method === 'POST') {
    return fromStoreResult(
      mockStore.createDish(
        telegramUserId,
        body as { name?: string; category?: string; cuisine?: string | null },
      ),
    )
  }

  const dishParams = matchPath(pathname, '/api/user/dishes/:id')
  if (dishParams && method === 'PUT') {
    return fromStoreResult(
      mockStore.updateDish(
        telegramUserId,
        dishParams.id,
        body as { name?: string; category?: string; cuisine?: string | null },
      ),
    )
  }

  if (dishParams && method === 'DELETE') {
    return fromStoreResult(mockStore.deleteDish(telegramUserId, dishParams.id))
  }

  const dishIngredientsParams = matchPath(
    pathname,
    '/api/user/dishes/:id/ingredients',
  )
  if (dishIngredientsParams && method === 'GET') {
    return fromStoreResult(
      mockStore.getDishIngredients(telegramUserId, dishIngredientsParams.id),
    )
  }

  if (dishIngredientsParams && method === 'POST') {
    return fromStoreResult(
      mockStore.addDishIngredient(
        telegramUserId,
        dishIngredientsParams.id,
        body as { name?: string; quantity?: string | null },
      ),
    )
  }

  const ingredientParams = matchPath(pathname, '/api/user/ingredients/:id')
  if (ingredientParams && method === 'DELETE') {
    return fromStoreResult(
      mockStore.deleteIngredient(telegramUserId, ingredientParams.id),
    )
  }

  if (pathname === '/api/dishes/ingredients' && method === 'POST') {
    return fromStoreResult(
      mockStore.getIngredientsByDishIds(
        telegramUserId,
        (body.dish_ids as string[] | undefined) ?? [],
      ),
    )
  }

  if (pathname === '/api/shopping-list' && method === 'GET') {
    return fromStoreResult(
      mockStore.getShoppingList(telegramUserId, query.week_start ?? null),
    )
  }

  if (pathname === '/api/shopping-list/generate' && method === 'POST') {
    if (!body.week_start) {
      return fail(400, 'week_start is required')
    }
    return fromStoreResult(
      mockStore.generateShoppingList(telegramUserId, String(body.week_start)),
    )
  }

  if (pathname === '/api/shopping-list' && method === 'POST') {
    return fromStoreResult(
      mockStore.addShoppingItem(
        telegramUserId,
        body as {
          name?: string
          quantity?: string | null
          source_type?: string
          source_dish_id?: string | null
          week_start?: string | null
        },
      ),
    )
  }

  const shoppingItemParams = matchPath(pathname, '/api/shopping-list/:id')
  if (shoppingItemParams && method === 'PATCH') {
    return fromStoreResult(
      mockStore.patchShoppingItem(telegramUserId, shoppingItemParams.id, {
        is_checked: body.is_checked as boolean | undefined,
      }),
    )
  }

  if (shoppingItemParams && method === 'DELETE') {
    return fromStoreResult(
      mockStore.deleteShoppingItem(telegramUserId, shoppingItemParams.id),
    )
  }

  if (pathname === '/api/shopping-list/clear-checked' && method === 'DELETE') {
    if (!telegramUserId) {
      return fail(401, 'Unauthorized. Please log in via Telegram.')
    }
    return ok({ success: true, deleted: 0 })
  }

  if (pathname === '/api/common-items' && method === 'GET') {
    return fromStoreResult(mockStore.getCommonItems(telegramUserId))
  }

  if (pathname === '/api/common-items' && method === 'POST') {
    return fromStoreResult(
      mockStore.addCommonItem(
        telegramUserId,
        body as { name?: string; default_quantity?: string | null },
      ),
    )
  }

  const commonItemParams = matchPath(pathname, '/api/common-items/:id')
  if (commonItemParams && method === 'DELETE') {
    return fromStoreResult(
      mockStore.deleteCommonItem(telegramUserId, commonItemParams.id),
    )
  }

  if (pathname === '/api/common-items/add-to-list' && method === 'POST') {
    return ok({ success: true })
  }

  if (pathname === '/api/send-menu' && method === 'POST') {
    return fromStoreResult(mockStore.sendMenu(telegramUserId))
  }

  if (pathname === '/api/menu' && method === 'GET') {
    return ok(mockStore.getMenuCatalog())
  }

  if (pathname === '/api/dishes' && method === 'GET') {
    return ok(mockStore.getMenuCatalog())
  }

  if (pathname === '/api/dishes/all' && method === 'GET') {
    return ok(mockStore.getAllDishes())
  }

  if (pathname === '/api/telegram/webhook' && method === 'GET') {
    return ok({ message: 'Telegram webhook endpoint is active' })
  }

  if (pathname === '/api/telegram/webhook' && method === 'POST') {
    return ok({ ok: true })
  }

  if (pathname === '/api/reminders/monday-cleanup' && method === 'POST') {
    return ok({ success: true })
  }

  if (pathname === '/api/reminders/sunday-shopping' && method === 'POST') {
    return ok({ success: true })
  }

  if (pathname === '/api/migrate-menu' && method === 'POST') {
    return ok({ success: true })
  }

  return { handled: false }
}
