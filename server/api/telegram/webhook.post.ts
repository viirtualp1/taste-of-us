export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const telegramBotToken = config.telegramBotToken

  if (!telegramBotToken) {
    console.error('Telegram bot token not configured')
    return { ok: false, error: 'Bot token not configured' }
  }

  try {
    const body = await readBody(event)

    console.log('Webhook received:', JSON.stringify(body, null, 2))

    const message = body.message || body.edited_message
    const text = message?.text

    if (text === '/start') {
      const chatId = message.chat.id
      const firstName = message.from?.first_name || 'there'

      console.log(`Processing /start command from chat ${chatId}`)

      const welcomeMessage = `👋 Hello, ${firstName}!

🍽️ Welcome to *Taste of Us* — a weekly menu planning app!

📱 *How it works:*

1️⃣ *In the bot app* (open via menu button or link):
   • Plan your weekly menu (brunch, dinner, dessert)
   • Manage your dish collection
   • Create shopping lists
   • Send menu to your partner

2️⃣ *In this chat* you will receive:
   • 📋 Text menu
   • All messages are automatically pinned

💡 *Tip:* To receive menus, your partner needs to add your Chat ID in profile settings.

Start planning your menu right now! 🎉`

      const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            parse_mode: 'Markdown',
          }),
        })

        const responseData = await response.text()
        console.log('Telegram API response status:', response.status)
        console.log('Telegram API response:', responseData)

        if (!response.ok) {
          console.error('Error sending welcome message:', responseData)
        }
      } catch (fetchError) {
        console.error('Error calling Telegram API:', fetchError)
      }

      return { ok: true }
    }

    console.log('Webhook received but not /start command. Text:', text)
    return { ok: true }
  } catch (error) {
    console.error('Error in webhook handler:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
