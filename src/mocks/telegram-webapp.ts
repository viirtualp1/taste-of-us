import { MOCK_INIT_DATA, MOCK_TELEGRAM_USER } from './data/constants'

type ClickCallback = () => void

function createNoopStorage() {
  const storage = new Map<string, string>()
  return {
    setItem(
      key: string,
      value: string,
      callback?: (error: Error | null, success: boolean) => void,
    ) {
      storage.set(key, value)
      callback?.(null, true)
    },
    getItem(key: string, callback: (error: Error | null, value: string | null) => void) {
      callback(null, storage.get(key) ?? null)
    },
    getItems(
      keys: string[],
      callback: (error: Error | null, values: Record<string, string>) => void,
    ) {
      const values: Record<string, string> = {}
      for (const key of keys) {
        const value = storage.get(key)
        if (value !== undefined) values[key] = value
      }
      callback(null, values)
    },
    removeItem(
      key: string,
      callback?: (error: Error | null, success: boolean) => void,
    ) {
      storage.delete(key)
      callback?.(null, true)
    },
    removeItems(
      keys: string[],
      callback?: (error: Error | null, success: boolean) => void,
    ) {
      for (const key of keys) storage.delete(key)
      callback?.(null, true)
    },
    getKeys(callback: (error: Error | null, keys: string[]) => void) {
      callback(null, Array.from(storage.keys()))
    },
  }
}

export function setupTelegramWebAppMock() {
  if (typeof window === 'undefined') return

  const backClickHandlers = new Set<ClickCallback>()
  const mainClickHandlers = new Set<ClickCallback>()

  const webApp = {
    initData: MOCK_INIT_DATA,
    initDataUnsafe: {
      user: { ...MOCK_TELEGRAM_USER },
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'dev_mock_hash',
    },
    version: '7.0',
    platform: 'web',
    colorScheme: 'light' as const,
    themeParams: {
      bg_color: '#ffffff',
      text_color: '#111827',
      hint_color: '#6b7280',
      link_color: '#15803d',
      button_color: '#22c55e',
      button_text_color: '#ffffff',
    },
    isExpanded: true,
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
    headerColor: '#ffffff',
    backgroundColor: '#f0f9f4',
    BackButton: {
      isVisible: false,
      onClick(callback: ClickCallback) {
        backClickHandlers.add(callback)
      },
      offClick(callback: ClickCallback) {
        backClickHandlers.delete(callback)
      },
      show() {
        this.isVisible = true
      },
      hide() {
        this.isVisible = false
      },
    },
    MainButton: {
      text: 'Continue',
      color: '#22c55e',
      textColor: '#ffffff',
      isVisible: false,
      isActive: true,
      isProgressVisible: false,
      setText(text: string) {
        this.text = text
      },
      onClick(callback: ClickCallback) {
        mainClickHandlers.add(callback)
      },
      offClick(callback: ClickCallback) {
        mainClickHandlers.delete(callback)
      },
      show() {
        this.isVisible = true
      },
      hide() {
        this.isVisible = false
      },
      enable() {
        this.isActive = true
      },
      disable() {
        this.isActive = false
      },
      showProgress() {
        this.isProgressVisible = true
      },
      hideProgress() {
        this.isProgressVisible = false
      },
      setParams(params: {
        text?: string
        color?: string
        text_color?: string
        is_active?: boolean
        is_visible?: boolean
      }) {
        if (params.text !== undefined) this.text = params.text
        if (params.color !== undefined) this.color = params.color
        if (params.text_color !== undefined) this.textColor = params.text_color
        if (params.is_active !== undefined) this.isActive = params.is_active
        if (params.is_visible !== undefined) this.isVisible = params.is_visible
      },
    },
    HapticFeedback: {
      impactOccurred() {},
      notificationOccurred() {},
      selectionChanged() {},
    },
    ready() {},
    expand() {},
    close() {},
    sendData() {},
    openLink(url: string) {
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    openTelegramLink(url: string) {
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    openInvoice() {},
    showPopup(
      params: { title?: string; message: string },
      callback?: (id: string) => void,
    ) {
      window.alert(params.title ? `${params.title}\n\n${params.message}` : params.message)
      callback?.('ok')
    },
    showAlert(message: string, callback?: () => void) {
      window.alert(message)
      callback?.()
    },
    showConfirm(message: string, callback?: (confirmed: boolean) => void) {
      callback?.(window.confirm(message))
    },
    showScanQrPopup(_params: { text?: string }, callback?: (data: string) => void) {
      callback?.('')
    },
    closeScanQrPopup() {},
    readTextFromClipboard(callback?: (text: string) => void) {
      callback?.('')
    },
    requestWriteAccess(callback?: (granted: boolean) => void) {
      callback?.(true)
    },
    requestContact(callback?: (granted: boolean) => void) {
      callback?.(true)
    },
    cloudStorage: createNoopStorage(),
    onEvent() {},
    offEvent() {},
  }

  window.Telegram = {
    WebApp: webApp,
  }

  console.info('[msw] Telegram WebApp mock enabled for local development')
}
