import { computed, readonly, ref } from 'vue'
import WebApp from '@twa-dev/sdk'

export type ColorScheme = 'light' | 'dark'

const colorScheme = ref<ColorScheme>('light')
let initialized = false

function resolveColorScheme(): ColorScheme {
  try {
    return WebApp.colorScheme === 'dark' ? 'dark' : 'light'
  } catch {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark'
    }
    return 'light'
  }
}

function applyColorScheme(scheme: ColorScheme) {
  colorScheme.value = scheme

  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.toggle('dark', scheme === 'dark')
  root.style.colorScheme = scheme
}

function handleThemeChanged() {
  applyColorScheme(resolveColorScheme())
}

export function useTelegramTheme() {
  const init = () => {
    if (initialized) {
      applyColorScheme(resolveColorScheme())
      return
    }

    initialized = true
    applyColorScheme(resolveColorScheme())

    try {
      WebApp.onEvent('themeChanged', handleThemeChanged)
    } catch {
      /* outside Telegram */
    }
  }

  const cleanup = () => {
    try {
      WebApp.offEvent('themeChanged', handleThemeChanged)
    } catch {
      /* outside Telegram */
    }
    initialized = false
  }

  return {
    colorScheme: readonly(colorScheme),
    isDark: computed(() => colorScheme.value === 'dark'),
    init,
    cleanup,
  }
}

if (typeof window !== 'undefined') {
  applyColorScheme(resolveColorScheme())

  try {
    WebApp.onEvent('themeChanged', handleThemeChanged)
    initialized = true
  } catch {
    /* outside Telegram */
  }
}
