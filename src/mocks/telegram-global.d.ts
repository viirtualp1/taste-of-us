export {}

declare global {
  interface Window {
    Telegram?: {
      WebApp: Record<string, unknown>
    }
  }
}
