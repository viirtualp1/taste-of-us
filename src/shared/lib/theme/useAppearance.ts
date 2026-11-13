import { getTelegramWebApp } from '@/shared/lib/telegram/getTelegramWebApp'

export type DesignSystem = 'glass' | 'material'
export type AppearancePreference = 'automatic' | DesignSystem

interface PlatformNavigator {
  platform: string
  userAgent: string
  userAgentData?: { platform: string }
}

const storageKey = 'taste-of-us-appearance'

export function useAppearance() {
  const preference = useState<AppearancePreference>(
    'appearance-preference',
    () => 'automatic',
  )
  const platformDesign = useState<DesignSystem>(
    'platform-design',
    () => 'material',
  )
  const design = computed(() =>
    preference.value === 'automatic' ? platformDesign.value : preference.value,
  )

  function initialize() {
    const telegram = getTelegramWebApp<{
      platform?: string
      initData?: string
    }>()
    platformDesign.value = detectDesign(
      window.navigator,
      telegram?.initData ? telegram.platform : undefined,
    )

    try {
      const saved = localStorage.getItem(storageKey)

      if (saved === 'glass' || saved === 'material') preference.value = saved
    } catch {
      // The appearance still works when the browser blocks local storage.
    }
  }

  function setPreference(value: AppearancePreference) {
    preference.value = value

    try {
      localStorage.setItem(storageKey, value)
    } catch {
      // Keep the choice for this session when storage is unavailable.
    }
  }

  return { preference: readonly(preference), design, initialize, setPreference }
}

function detectDesign(
  browser: PlatformNavigator,
  telegramPlatform?: string,
): DesignSystem {
  if (/^(ios|ipados|macos)$/i.test(telegramPlatform ?? '')) return 'glass'
  if (/^(android|android_x|windows|linux)$/i.test(telegramPlatform ?? '')) {
    return 'material'
  }

  const platform = browser.userAgentData?.platform || browser.platform
  const isApple =
    /^(Mac|iPhone|iPad|iPod)/i.test(platform) ||
    /iPhone|iPad|iPod|Macintosh/i.test(browser.userAgent)

  return isApple ? 'glass' : 'material'
}
