import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTelegram } from './useTelegram'

interface RequireAuthOptions {
  redirectTo?: string
  onFailure?: (error: string) => void
  onReady?: (context: { didAuthenticate: boolean }) => void | Promise<void>
}

export function useRequireAuth(options: RequireAuthOptions = {}) {
  const { t } = useI18n()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, authenticate } = useTelegram()
  const isReady = ref(false)

  const markReady = async (didAuthenticate: boolean) => {
    isReady.value = true
    await options.onReady?.({ didAuthenticate })
  }

  onMounted(async () => {
    while (authLoading.value) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    if (isAuthenticated.value) {
      await markReady(false)
      return
    }

    try {
      const result = await authenticate()
      if (!result.success) {
        const message = result.error || t('auth.authFailed')
        if (options.onFailure) {
          options.onFailure(message)
        } else if (options.redirectTo) {
          await router.push(options.redirectTo)
        }
        return
      }

      await markReady(true)
    } catch (error) {
      console.error('Authentication error:', error)
      if (options.onFailure) {
        options.onFailure(t('auth.openInTelegram'))
      } else if (options.redirectTo) {
        await router.push(options.redirectTo)
      }
    }
  })

  return {
    isAuthenticated,
    authLoading,
    isReady,
    authenticate,
  }
}
