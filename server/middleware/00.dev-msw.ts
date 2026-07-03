import { resolveMockRequest } from '@/mocks/resolveRequest'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!import.meta.dev || !config.public.mswEnabled) {
    return
  }

  const { pathname } = getRequestURL(event)
  if (!pathname.startsWith('/api/')) {
    return
  }

  let body: unknown
  if (event.method !== 'GET' && event.method !== 'HEAD') {
    try {
      body = await readBody(event)
    } catch {
      body = undefined
    }
  }

  const result = await resolveMockRequest(pathname + (getRequestURL(event).search || ''), {
    method: event.method,
    headers: getHeaders(event),
    body,
    query: getQuery(event),
  })

  if (!result.handled) {
    return
  }

  if (result.error) {
    throw createError({
      statusCode: result.error.status,
      message: result.error.message,
      data: {
        statusCode: result.error.status,
        message: result.error.message,
      },
    })
  }

  return result.data
})
