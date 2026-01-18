import { useAuth } from './useAuth'

interface ApiFetchError {
  statusCode?: number
  status?: number
  data?: {
    statusCode?: number
    message?: string
  }
  error?: boolean
  message?: string
}

export function useApiFetch() {
  const { handleAuthError, getAuthHeaders } = useAuth()

  const apiFetch = async <T = unknown>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      body?: unknown
      headers?: Record<string, string>
      query?: Record<string, string | number | boolean | undefined>
    } = {},
  ): Promise<T> => {
    try {
      const headers = {
        ...getAuthHeaders(),
        ...options.headers,
      }

      const result = await $fetch<T>(url, {
        method: options.method,
        body: options.body as
          | BodyInit
          | Record<string, unknown>
          | null
          | undefined,
        query: options.query,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      })

      return result as T
    } catch (error: unknown) {
      const apiError = error as ApiFetchError
      if (handleAuthError(apiError)) {
        throw error
      }
      throw error
    }
  }

  return {
    apiFetch,
  }
}
