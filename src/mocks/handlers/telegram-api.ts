import { http, HttpResponse } from 'msw'
import { mockStore } from '../data/store'

export const telegramApiHandlers = [
  http.post('https://api.telegram.org/bot*/:method', async ({ params, request }) => {
    const method = String(params.method)
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const result = mockStore.recordTelegramApiCall(method, body)

    if (!result.ok) {
      return HttpResponse.json(
        { ok: false, description: result.description },
        { status: 400 },
      )
    }

    return HttpResponse.json({ ok: true, result: result.result })
  }),

  http.get('https://api.telegram.org/bot*/:method', ({ params }) => {
    const method = String(params.method)
    return HttpResponse.json({
      ok: true,
      result: {
        url: `https://mock.telegram.local/${method}`,
        has_custom_certificate: false,
        pending_update_count: 0,
      },
    })
  }),
]
