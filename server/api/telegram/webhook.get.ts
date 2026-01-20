export default defineEventHandler(() => {
  return {
    ok: true,
    message: 'Telegram webhook endpoint is active',
    timestamp: new Date().toISOString()
  }
})
