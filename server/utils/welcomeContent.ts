const DEFAULT_APP_URL = 'https://taste-of-us.com'

/** Legacy Telegram Markdown — escape user-controlled text. */
function escapeMarkdown(text: string): string {
  return text.replace(/([_*`[])/g, '\\$1')
}

export function resolveAppUrl(configUrl?: string): string {
  return configUrl?.trim() || DEFAULT_APP_URL
}

export function buildWelcomeMessage(firstName: string): string {
  const name = escapeMarkdown(firstName.trim() || 'there')

  return `👋 *Hi, ${name}!*

*Taste of Us* — plan your week together.

*In the app*
· Pick dishes for each day
· Manage your recipe list
· Build a shopping list
· Send the menu in one tap

*In this chat*
· You get the menu as a message
· New menus are pinned automatically

💡 *One setup step:* add your partner's Chat ID in *Settings* so they receive menus too. They need to send */start* to this bot first.

Tap *Open planner* below to get started ↓`
}

export function buildWelcomeKeyboard(appUrl: string = DEFAULT_APP_URL) {
  return {
    inline_keyboard: [
      [
        {
          text: '🍽 Open planner',
          web_app: { url: appUrl },
        },
      ],
      [
        {
          text: '🆔 Get my Chat ID',
          url: 'https://t.me/userinfobot',
        },
      ],
    ],
  }
}

export function buildWelcomePayload(firstName: string, appUrl?: string) {
  const url = resolveAppUrl(appUrl)

  return {
    text: buildWelcomeMessage(firstName),
    parse_mode: 'Markdown' as const,
    reply_markup: buildWelcomeKeyboard(url),
  }
}
