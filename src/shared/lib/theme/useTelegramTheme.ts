import { getTelegramWebApp } from '@/shared/lib/telegram/getTelegramWebApp'

export type ColorScheme = 'light' | 'dark'

interface TelegramTheme {
  initData?: string
  colorScheme?: ColorScheme
  onEvent?: (event: 'themeChanged', callback: () => void) => void
  offEvent?: (event: 'themeChanged', callback: () => void) => void
}

const colorScheme = ref<ColorScheme>('light')
let media: MediaQueryList | undefined
let telegram: TelegramTheme | null = null

function applyColorScheme() {
  colorScheme.value =
    telegram?.initData && telegram.colorScheme
      ? telegram.colorScheme
      : media?.matches
        ? 'dark'
        : 'light'

  const root = document.documentElement
  root.classList.toggle('dark', colorScheme.value === 'dark')
  root.style.colorScheme = colorScheme.value
}

function init() {
  if (media) return

  media = window.matchMedia('(prefers-color-scheme: dark)')
  telegram = getTelegramWebApp<TelegramTheme>()
  media.addEventListener('change', applyColorScheme)
  telegram?.onEvent?.('themeChanged', applyColorScheme)
  applyColorScheme()
}

function cleanup() {
  media?.removeEventListener('change', applyColorScheme)
  telegram?.offEvent?.('themeChanged', applyColorScheme)
  media = undefined
  telegram = null
}

export function useTelegramTheme() {
  return {
    colorScheme: readonly(colorScheme),
    isDark: computed(() => colorScheme.value === 'dark'),
    init,
    cleanup,
  }
}
