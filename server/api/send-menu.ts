import puppeteer from 'puppeteer'
import { readFile } from 'fs/promises'
import { join } from 'path'

async function checkChromeAvailable(): Promise<boolean> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    await browser.close()
    return true
  } catch {
    return false
  }
}

interface MenuDay {
  day: string
  date: string
  meals: {
    brunch: string
    dinner: string
    dessert: string
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ menu: MenuDay[] }>(event)

  if (!body.menu || !Array.isArray(body.menu)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid menu data',
    })
  }

  const telegramBotToken = config.telegramBotToken

  if (!telegramBotToken) {
    throw createError({
      statusCode: 500,
      message:
        'Telegram bot not configured. Please set TELEGRAM_BOT_TOKEN environment variable.',
    })
  }

  const { requireTelegramAuth } = await import('../utils/auth')
  const { createSupabaseClient } = await import('../utils/supabase')

  const telegramUserId = await requireTelegramAuth(event)

  const supabase = createSupabaseClient()
  const { data: row, error: fetchErr } = await supabase
    .from('telegram_users')
    .select('recipient_telegram_chat_id')
    .eq('telegram_id', telegramUserId)
    .single()

  if (fetchErr && fetchErr.code !== 'PGRST116') {
    throw createError({
      statusCode: 500,
      message: 'Failed to load settings. Please try again.',
    })
  }

  const telegramChatId = (row?.recipient_telegram_chat_id ?? '').trim() || null
  if (!telegramChatId) {
    throw createError({
      statusCode: 400,
      message:
        'Set recipient Telegram Chat ID in Profile settings to send the menu.',
    })
  }

  try {
    const menuText = formatMenuForTelegram(body.menu)

    let messageId: number | null = null
    let pdfSent = false
    let pdfError: string | null = null

    const chromeAvailable = await checkChromeAvailable()

    if (chromeAvailable) {
      try {
        const pdfBuffer = await generateMenuPDF(body.menu)

        const result = await sendTelegramDocument(
          telegramBotToken,
          telegramChatId,
          pdfBuffer,
          'menu.pdf',
          menuText,
        )
        pdfSent = true

        if (result && result.result && result.result.message_id) {
          messageId = result.result.message_id

          if (!messageId) return

          try {
            await pinTelegramMessage(
              telegramBotToken,
              telegramChatId,
              messageId,
            )
          } catch {
            // Ignore pin errors
          }
        }
      } catch (pdfErrorCaught: any) {
        const errorMessage =
          pdfErrorCaught instanceof Error
            ? pdfErrorCaught.message
            : String(pdfErrorCaught)

        if (errorMessage !== 'CHROME_NOT_AVAILABLE') {
          pdfError = errorMessage
        }
      }
    }

    if (!pdfSent) {
      try {
        const textResult = await sendTelegramMessage(
          telegramBotToken,
          telegramChatId,
          menuText,
        )
        const textMessageId = textResult?.result?.message_id
        if (textMessageId) {
          try {
            await pinTelegramMessage(
              telegramBotToken,
              telegramChatId,
              textMessageId,
            )
            messageId = textMessageId
          } catch {
            // Ignore pin errors
          }
        }
      } catch (textError: any) {
        const textErrorMessage =
          textError?.message || String(textError) || 'Unknown error'

        if (
          textErrorMessage.includes('chat not found') ||
          textErrorMessage.includes('bot was blocked') ||
          textErrorMessage.includes('user is deactivated') ||
          textErrorMessage.includes('Forbidden')
        ) {
          throw createError({
            statusCode: 400,
            message:
              'Cannot send message to this Telegram user. Please make sure:\n' +
              '1. The user has started a conversation with the bot (send /start to the bot)\n' +
              '2. The user has not blocked the bot\n' +
              '3. The Telegram Chat ID is correct\n\n' +
              `Error: ${textErrorMessage}`,
          })
        }

        throw createError({
          statusCode: 500,
          message: `Failed to send menu: ${textErrorMessage}`,
        })
      }
    }

    return {
      success: true,
      message: pdfSent
        ? 'Menu PDF sent and pinned successfully'
        : 'Menu sent successfully (PDF generation failed)',
      pdfSent,
      pinned: messageId !== null,
      pdfError: pdfError || undefined,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw createError({
      statusCode: 500,
      message: `Failed to send menu: ${errorMessage}`,
    })
  }
})

function formatMenuForTelegram(menu: MenuDay[]) {
  let text = '🍽️ *Weekly Menu Plan*\n\n'

  menu.forEach((day) => {
    text += `📅 *${day.day}*\n`
    if (day.meals.brunch) text += `🌅 Brunch: ${day.meals.brunch}\n`
    if (day.meals.dinner) text += `🌙 Dinner: ${day.meals.dinner}\n`
    if (day.meals.dessert) text += `🍰 Dessert: ${day.meals.dessert}\n`
    if (!day.meals.brunch && !day.meals.dinner && !day.meals.dessert) {
      text += `_No meals planned_\n`
    }
    text += '\n'
  })

  return text
}

async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    }),
  })

  const responseText = await response.text()

  if (!response.ok) {
    let errorMessage = `Telegram API error: ${responseText}`

    try {
      const errorJson = JSON.parse(responseText)
      if (errorJson.description) {
        errorMessage = `Telegram API error: ${errorJson.description}`
      }
      if (errorJson.error_code) {
        errorMessage += ` (Error code: ${errorJson.error_code})`
      }
    } catch {
      // Ignore parse errors
    }

    throw new Error(errorMessage)
  }

  return JSON.parse(responseText)
}

async function pinTelegramMessage(
  token: string,
  chatId: string,
  messageId: number,
) {
  const url = `https://api.telegram.org/bot${token}/pinChatMessage`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      disable_notification: false,
    }),
  })

  const responseText = await response.text()

  if (!response.ok) {
    let errorMessage = `Telegram API error: ${responseText}`

    try {
      const errorJson = JSON.parse(responseText)
      if (errorJson.description) {
        errorMessage = `Telegram API error: ${errorJson.description}`
      }
    } catch {
      // Ignore parse errors
    }

    throw new Error(errorMessage)
  }

  return JSON.parse(responseText)
}

async function sendTelegramDocument(
  token: string,
  chatId: string,
  document: Buffer,
  filename: string,
  caption?: string,
) {
  if (document.length > 50 * 1024 * 1024) {
    throw new Error('PDF file is too large (max 50MB for Telegram Bot API)')
  }

  const FormDataModule = await import('form-data')
  const FormDataClass = FormDataModule.default
  const https = await import('https')
  const { URL } = await import('url')

  const form = new FormDataClass()

  form.append('chat_id', String(chatId))
  form.append('document', document, {
    filename: filename,
    contentType: 'application/pdf',
    knownLength: document.length,
  })

  if (caption) {
    form.append('caption', caption)
    form.append('parse_mode', 'Markdown')
  }

  const apiUrl = new URL(`https://api.telegram.org/bot${token}/sendDocument`)
  const headers = form.getHeaders()

  const response = await new Promise<{
    statusCode: number
    statusMessage: string
    data: string
  }>((resolve, reject) => {
    const req = https.request(
      {
        hostname: apiUrl.hostname,
        path: apiUrl.pathname + apiUrl.search,
        method: 'POST',
        headers: headers,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk.toString()
        })
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 500,
            statusMessage: res.statusMessage || 'Unknown',
            data,
          })
        })
      },
    )

    req.on('error', (error) => {
      reject(error)
    })

    form.pipe(req)
  })

  const responseText = response.data
  if (response.statusCode !== 200) {
    let errorMessage = `Telegram API error (${response.statusCode}): ${responseText || 'Empty response'}`

    try {
      if (responseText) {
        const errorJson = JSON.parse(responseText)
        if (errorJson.description) {
          errorMessage = `Telegram API error: ${errorJson.description}`
        }
        if (errorJson.error_code) {
          errorMessage += ` (Error code: ${errorJson.error_code})`
        }
      }
    } catch {
      // Ignore parse errors
    }

    throw new Error(errorMessage)
  }

  if (!responseText) {
    throw new Error('Empty response from Telegram API')
  }

  const result = JSON.parse(responseText)
  if (!result.ok) {
    throw new Error(
      `Telegram API error: ${result.description || 'Unknown error'}`,
    )
  }

  return result
}

function isChromeError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const lowerMessage = errorMessage.toLowerCase()
  return (
    lowerMessage.includes('chrome') ||
    lowerMessage.includes('chromium') ||
    lowerMessage.includes('browser') ||
    lowerMessage.includes('executable') ||
    lowerMessage.includes('could not find')
  )
}

async function generateMenuPDF(menu: MenuDay[]) {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
    })
  } catch (error) {
    if (isChromeError(error)) {
      throw new Error('CHROME_NOT_AVAILABLE')
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to launch browser: ${errorMessage}`)
  }

  try {
    const page = await browser.newPage()

    let faviconBase64 = ''
    try {
      const faviconPath = join(process.cwd(), 'public', 'favicon.jpg')
      const faviconBuffer = await readFile(faviconPath)
      faviconBase64 = `data:image/jpeg;base64,${faviconBuffer.toString('base64')}`
    } catch {
      // Favicon is optional
    }

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }

    const getMealIcon = (type: string) => {
      const icons: Record<string, string> = {
        brunch: '🌅',
        dinner: '🌙',
        dessert: '🍰',
      }
      return icons[type] || '🍽️'
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 0;
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #f0fdf4 50%, #dcfce7 100%);
              min-height: 100vh;
              padding: 20px;
              color: #111827;
            }

            .container {
              max-width: 800px;
              margin: 0 auto;
            }

            .header {
              text-align: center;
              margin-bottom: 20px;
              background: #ffffff;
              padding: 20px;
              border-radius: 16px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.06);
              border: 1px solid #bbf7d0;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .header-logo {
              position: absolute;
              left: 20px;
              width: 60px;
              height: 60px;
              border-radius: 50%;
              object-fit: cover;
            }

            .header-content {
              flex: 1;
              text-align: center;
            }

            .header h1 {
              font-size: 32px;
              font-weight: 800;
              color: #15803d;
              margin-bottom: 4px;
            }

            .header p {
              font-size: 14px;
              color: #6b7280;
              font-weight: 500;
            }

            .week-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              margin-bottom: 0;
            }

            .day-card {
              background: #ffffff;
              border-radius: 12px;
              padding: 16px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.06);
              border: 1px solid #e5e7eb;
              page-break-inside: avoid;
              margin-bottom: 0;
            }

            .day-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 2px solid #bbf7d0;
            }

            .day-title {
              font-size: 16px;
              font-weight: 700;
              color: #111827;
            }

            .day-date {
              font-size: 10px;
              color: #6b7280;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .meals {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }

            .meal-item {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              padding: 10px;
              border-radius: 12px;
              border-left: 4px solid;
            }

            .meal-item.brunch {
              border-left-color: #86efac;
              background: #f0fdf4;
            }

            .meal-item.dinner {
              border-left-color: #4ade80;
              background: #f0fdf4;
            }

            .meal-item.dessert {
              border-left-color: #22c55e;
              background: #dcfce7;
            }

            .meal-icon {
              font-size: 18px;
              flex-shrink: 0;
            }

            .meal-content {
              flex: 1;
            }

            .meal-type {
              font-size: 9px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #6b7280;
              margin-bottom: 2px;
            }

            .meal-name {
              font-size: 13px;
              font-weight: 600;
              color: #111827;
            }

            .empty-meal {
              font-size: 11px;
              color: #6b7280;
              font-style: italic;
              padding: 8px;
              text-align: center;
              background: #f9fafb;
              border-radius: 12px;
              border: 1px dashed #e5e7eb;
            }

            @media print {
              body {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #f0fdf4 50%, #dcfce7 100%);
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${faviconBase64 ? `<img src="${faviconBase64}" alt="Taste of Us" class="header-logo" />` : ''}
              <div class="header-content">
                <h1>Taste of Us</h1>
                <p>Weekly Menu Plan</p>
              </div>
            </div>

            <div class="week-grid">
              ${menu
                .map((day) => {
                  const meals = [
                    { type: 'brunch', name: day.meals.brunch },
                    { type: 'dinner', name: day.meals.dinner },
                    { type: 'dessert', name: day.meals.dessert },
                  ].filter((meal) => meal.name)

                  return `
                  <div class="day-card">
                    <div class="day-header">
                      <div class="day-title">${day.day}</div>
                      <div class="day-date">${formatDate(day.date)}</div>
                    </div>
                    <div class="meals">
                      ${
                        meals.length > 0
                          ? meals
                              .map(
                                (meal) => `
                        <div class="meal-item ${meal.type}">
                          <div class="meal-icon">${getMealIcon(meal.type)}</div>
                          <div class="meal-content">
                            <div class="meal-type">${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</div>
                            <div class="meal-name">${meal.name}</div>
                          </div>
                        </div>
                      `,
                              )
                              .join('')
                          : '<div class="empty-meal">No meals planned for this day</div>'
                      }
                    </div>
                  </div>
                `
                })
                .join('')}
            </div>
          </div>
        </body>
      </html>
    `

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })

    await new Promise((resolve) => setTimeout(resolve, 500))

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      preferCSSPageSize: true,
    })

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty')
    }

    return Buffer.from(pdfBuffer)
  } catch (error) {
    if (isChromeError(error)) {
      throw new Error('CHROME_NOT_AVAILABLE')
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to generate PDF: ${errorMessage}`)
  } finally {
    if (browser) {
      await browser.close().catch(() => {
        // Ignore close errors
      })
    }
  }
}
