export const LOCALE_PREFERENCE_KEY = 'locale-preference-chosen'

export const SUPPORTED_LOCALES = ['en', 'ru'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_DATE_MAP: Record<AppLocale, string> = {
  en: 'en-US',
  ru: 'ru-RU',
}
