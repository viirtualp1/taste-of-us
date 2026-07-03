import { FetchError } from 'ofetch'
import { MOCK_TELEGRAM_USER } from '@/mocks/data/constants'
import { resolveMockRequest } from '@/mocks/resolveRequest'
import { setupTelegramWebAppMock } from '@/mocks/telegram-webapp'
import { startMockServiceWorker } from '@/mocks/browser'

function throwMockFetchError(status: number, message: string): never {
  throw new FetchError({
    message: `[${status}] ${message}`,
    status,
    statusText: message,
    data: { statusCode: status, message },
  })
}

function wrapFetch(original: typeof $fetch) {
  const wrapped = (async (request: string, options?: Parameters<typeof $fetch>[1]) => {
    const result = await resolveMockRequest(request, {
      method: options?.method,
      headers: options?.headers as Record<string, string> | undefined,
      body: options?.body,
      query: options?.query as Record<string, string | number | boolean | undefined>,
    })

    if (result.handled) {
      if (result.error) {
        throwMockFetchError(result.error.status, result.error.message)
      }
      return result.data
    }

    return original(request, options)
  }) as typeof $fetch

  return Object.assign(wrapped, original)
}

export default defineNuxtPlugin({
  name: 'msw',
  enforce: 'pre',
  parallel: false,
  async setup() {
    const config = useRuntimeConfig()
    if (!import.meta.dev || !config.public.mswEnabled) return

    const applyDevTelegram = () => {
      setupTelegramWebAppMock()
      try {
        localStorage.setItem('telegram_user', JSON.stringify(MOCK_TELEGRAM_USER))
      } catch {
        /* ignore */
      }
    }

    applyDevTelegram()
    window.addEventListener('load', applyDevTelegram, { once: true })

    globalThis.$fetch = wrapFetch(globalThis.$fetch)

    await startMockServiceWorker()
  },
})
