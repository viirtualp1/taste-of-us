import { apiHandlers } from './api'
import { telegramApiHandlers } from './telegram-api'

export const handlers = [...apiHandlers, ...telegramApiHandlers]
