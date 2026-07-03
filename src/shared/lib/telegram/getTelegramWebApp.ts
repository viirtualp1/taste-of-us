export function getTelegramWebApp<T = Record<string, unknown>>(): T | null {
  if (typeof window === 'undefined') return null
  return (window.Telegram?.WebApp as T | undefined) ?? null
}
