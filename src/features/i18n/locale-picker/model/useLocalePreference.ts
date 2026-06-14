import { ref } from 'vue'
import { LOCALE_PREFERENCE_KEY, type AppLocale } from '@/shared/i18n/constants'

const isPickerOpen = ref(false)

export function useLocalePreference() {
  const { locale, setLocale } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  const markLocaleChosen = (code: AppLocale) => {
    if (import.meta.client) {
      localStorage.setItem(LOCALE_PREFERENCE_KEY, code)
    }
  }

  const hasChosenLocale = () => {
    if (!import.meta.client) return true
    return !!localStorage.getItem(LOCALE_PREFERENCE_KEY)
  }

  const openPickerIfNeeded = () => {
    if (!hasChosenLocale()) {
      isPickerOpen.value = true
    }
  }

  const switchLocale = async (code: AppLocale) => {
    markLocaleChosen(code)
    await setLocale(code)
    await navigateTo(switchLocalePath(code))
    isPickerOpen.value = false
  }

  return {
    locale,
    isPickerOpen,
    openPickerIfNeeded,
    switchLocale,
    markLocaleChosen,
  }
}
