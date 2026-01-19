import { ref, computed } from 'vue'
import WebApp from '@twa-dev/sdk'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    auth_date?: number
    hash?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    setParams: (params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  ready: () => void
  expand: () => void
  close: () => void
  sendData: (data: string) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string, callback?: (status: string) => void) => void
  showPopup: (params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text: string
    }>
  }, callback?: (id: string) => void) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  showScanQrPopup: (params: {
    text?: string
  }, callback?: (data: string) => void) => void
  closeScanQrPopup: () => void
  readTextFromClipboard: (callback?: (text: string) => void) => void
  requestWriteAccess: (callback?: (granted: boolean) => void) => void
  requestContact: (callback?: (granted: boolean) => void) => void
  cloudStorage: {
    setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void
    getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void
    getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void
    removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void
    removeItems: (keys: string[], callback?: (error: Error | null, success: boolean) => void) => void
    getKeys: (callback: (error: Error | null, keys: string[]) => void) => void
  }
}

const user = ref<TelegramUser | null>(null)
const webApp = ref<TelegramWebApp | null>(null)
const isReady = ref(false)
const isLoading = ref(true)

export function useTelegram() {
  const isAuthenticated = computed(() => !!user.value)

  const init = () => {
    if (typeof window === 'undefined') {
      isLoading.value = false
      return
    }

    try {
      try {
        const savedUser = localStorage.getItem('telegram_user')
        if (savedUser) {
          user.value = JSON.parse(savedUser)
        }
      } catch (e) {
        console.error('[useTelegram] Error restoring user from localStorage:', e)
      }

      WebApp.ready()
      WebApp.expand()

      const tg = WebApp as unknown as TelegramWebApp
      webApp.value = tg

      if (tg.initDataUnsafe?.user) {
        user.value = tg.initDataUnsafe.user

        try {
          localStorage.setItem('telegram_user', JSON.stringify(tg.initDataUnsafe.user))
        } catch (e) {
          console.error('[useTelegram] Error updating localStorage:', e)
        }
      }

      isReady.value = true
      isLoading.value = false
    } catch (error) {
      console.error('[useTelegram] Error initializing Telegram Web App:', error)
      isLoading.value = false
    }
  }

  const authenticate = async () => {
    if (!webApp.value) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (!webApp.value?.initData) {
      console.error('[useTelegram] authenticate: Web App not initialized or initData missing')
      throw new Error('Telegram Web App not initialized')
    }

    try {
      const response = await $fetch<{
        success: boolean
        user: TelegramUser
      }>('/api/auth/telegram', {
        method: 'POST',
        body: {
          initData: webApp.value.initData,
        },
      })

      if (response.success && response.user) {
        user.value = response.user

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('telegram_user', JSON.stringify(response.user))
          } catch (e) {
            console.error('[useTelegram] Error saving user to localStorage:', e)
          }
        }
        return { success: true }
      }

      return { success: false, error: 'Authentication failed' }
    } catch (error: unknown) {
      const authError = error as { message?: string; data?: any }
      console.error('[useTelegram] Auth error', {
        error,
        message: authError?.message,
        data: authError?.data,
      })
      return {
        success: false,
        error: authError?.message || 'Authentication failed',
      }
    }
  }

  const getAuthHeaders = (): Record<string, string> => {
    if (!user.value) {
      return {}
    }

    return {
      'X-Telegram-User-Id': String(user.value.id),
    }
  }

  const hapticFeedback = {
    light: () => webApp.value?.HapticFeedback?.impactOccurred('light'),
    medium: () => webApp.value?.HapticFeedback?.impactOccurred('medium'),
    heavy: () => webApp.value?.HapticFeedback?.impactOccurred('heavy'),
    success: () => webApp.value?.HapticFeedback?.notificationOccurred('success'),
    error: () => webApp.value?.HapticFeedback?.notificationOccurred('error'),
    warning: () => webApp.value?.HapticFeedback?.notificationOccurred('warning'),
  }

  const showAlert = (message: string) => {
    return new Promise<void>((resolve) => {
      webApp.value?.showAlert(message, () => resolve())
    })
  }

  const showConfirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      webApp.value?.showConfirm(message, (confirmed) => resolve(confirmed))
    })
  }

  const showPopup = (params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text: string
    }>
  }) => {
    return new Promise<string>((resolve) => {
      webApp.value?.showPopup(params, (id) => resolve(id))
    })
  }

  if (typeof window !== 'undefined') {
    init()
  }

  return {
    user,
    webApp,
    isReady,
    isLoading,
    isAuthenticated,
    init,
    authenticate,
    getAuthHeaders,
    hapticFeedback,
    showAlert,
    showConfirm,
    showPopup,
  }
}
