import puppeteer from 'puppeteer'
import { readFile } from 'fs/promises'
import { join } from 'path'

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

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized. Please log in.',
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token)

  if (authError || !user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token. Please log in again.',
    })
  }

  const { data: userSettings, error: settingsError } = await supabase
    .from('user_settings')
    .select('telegram_chat_id')
    .eq('user_id', user.id)
    .single()

  if (settingsError && settingsError.code !== 'PGRST116') {
    console.error('Error fetching user settings:', settingsError)
  }

  const telegramChatId = userSettings?.telegram_chat_id

  if (!telegramChatId) {
    throw createError({
      statusCode: 400,
      message:
        'Telegram Chat ID is required. Please set it in your profile settings.',
    })
  }

  try {
    const menuText = formatMenuForTelegram(body.menu)

    let messageId: number | null = null
    let pdfSent = false

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
          await pinTelegramMessage(telegramBotToken, telegramChatId, messageId)
        } catch (pinError) {
          console.error('Error pinning message:', pinError)
        }
      }
    } catch (pdfError: any) {
      console.error('Error generating/sending PDF:', pdfError)
      console.error(
        'PDF error details:',
        pdfError instanceof Error ? pdfError.stack : String(pdfError),
      )

      try {
        await sendTelegramMessage(telegramBotToken, telegramChatId, menuText)
      } catch (textError: any) {
        const textErrorMessage =
          textError?.message || String(textError) || 'Unknown error'
        console.error(
          'Failed to send text message as fallback:',
          textErrorMessage,
        )

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
    }
  } catch (error) {
    console.error('Error sending menu:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails =
      error instanceof Error && error.stack ? error.stack : String(error)
    console.error('Error details:', errorDetails)
    throw createError({
      statusCode: 500,
      message: `Failed to send menu: ${errorMessage}`,
    })
  }
})

function formatMenuForTelegram(menu: MenuDay[]) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  let text = '🍽️ *Weekly Menu Plan*\n\n'

  menu.forEach((day) => {
    const date = formatDate(day.date)
    text += `📅 *${day.day}* (${date})\n`
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

  try {
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
      } catch (err) {
        console.error('Error parsing error JSON:', err)
      }

      console.error('Telegram message send error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        chatId: chatId,
      })

      throw new Error(errorMessage)
    }

    return JSON.parse(responseText)
  } catch (error) {
    console.error('Error in sendTelegramMessage:', error)
    throw error
  }
}

async function pinTelegramMessage(
  token: string,
  chatId: string,
  messageId: number,
) {
  try {
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
      } catch (err) {
        console.error('Error parsing error JSON:', err)
      }

      console.error('Error pinning message:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText,
      })

      throw new Error(errorMessage)
    }

    return JSON.parse(responseText)
  } catch (error) {
    console.error('Error in pinTelegramMessage:', error)
    throw error
  }
}

async function sendTelegramDocument(
  token: string,
  chatId: string,
  document: Buffer,
  filename: string,
  caption?: string,
) {
  try {
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
      } catch (err) {
        console.error('Error parsing error JSON:', err)
      }

      console.error('Telegram document send error:', {
        status: response.statusCode,
        statusText: response.statusMessage,
        error: responseText || 'Empty response',
      })

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
  } catch (error) {
    console.error('Error in sendTelegramDocument:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
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
      ],
    })
  } catch (error) {
    console.error('Error launching browser:', error)
    throw new Error(
      `Failed to launch browser: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }

  try {
    const page = await browser.newPage()

    let faviconBase64 = ''
    try {
      const faviconPath = join(process.cwd(), 'public', 'favicon.jpg')
      const faviconBuffer = await readFile(faviconPath)
      faviconBase64 = `data:image/jpeg;base64,${faviconBuffer.toString('base64')}`
    } catch (error) {
      console.warn('Could not load favicon:', error)
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
              background: linear-gradient(135deg, #f8b4d9 0%, #fbcfe8 30%, #fce7f3 50%, #f8b4d9 100%);
              min-height: 100vh;
              padding: 20px 20px;
              color: #1f2937;
            }

            .container {
              max-width: 800px;
              margin: 0 auto;
            }

            .header {
              text-align: center;
              margin-bottom: 20px;
              background: rgba(255, 240, 245, 0.95);
              backdrop-filter: blur(20px);
              padding: 20px;
              border-radius: 16px;
              box-shadow: 0 8px 32px rgba(251, 113, 133, 0.4);
              border: 1px solid rgba(255, 192, 203, 0.3);
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
              color: #ec4899;
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
              background: rgba(255, 245, 250, 0.9);
              backdrop-filter: blur(20px);
              border-radius: 12px;
              padding: 16px;
              box-shadow: 0 8px 32px rgba(251, 113, 133, 0.3);
              border: 1px solid rgba(255, 192, 203, 0.4);
              page-break-inside: avoid;
              margin-bottom: 0;
            }

            .day-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 2px solid rgba(251, 113, 133, 0.4);
            }

            .day-title {
              font-size: 16px;
              font-weight: 700;
              color: #1f2937;
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
              background: rgba(255, 240, 245, 0.7);
              border-radius: 10px;
              border-left: 3px solid;
            }

            .meal-item.brunch {
              border-left-color: #fbcfe8;
              background: rgba(255, 228, 240, 0.7);
            }

            .meal-item.dinner {
              border-left-color: #f472b6;
              background: rgba(255, 200, 225, 0.7);
            }

            .meal-item.dessert {
              border-left-color: #fbbf24;
              background: rgba(255, 237, 213, 0.7);
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
              color: #1f2937;
            }

            .empty-meal {
              font-size: 11px;
              color: #fb7185;
              font-style: italic;
              padding: 8px;
              text-align: center;
              background: rgba(255, 228, 240, 0.5);
              border-radius: 10px;
            }

            @media print {
              body {
                background: linear-gradient(135deg, #f8b4d9 0%, #fbcfe8 30%, #fce7f3 50%, #f8b4d9 100%);
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
      waitUntil: 'domcontentloaded',
      timeout: 20000,
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
      timeout: 20000,
    })

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty')
    }

    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('Error generating PDF:', error)
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace',
    )
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  } finally {
    if (browser) {
      try {
        await browser.close()
      } catch (err) {
        console.error('Error closing browser:', err)
      }
    }
  }
}
