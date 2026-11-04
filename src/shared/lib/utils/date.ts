/**
 * Calendar dates are local `YYYY-MM-DD` keys. Never derive them with
 * `toISOString()`: that converts local midnight to UTC, which east of UTC
 * is the previous day (Monday 00:00 in Moscow → "Sunday" in UTC).
 */

export interface WeekDay {
  name: string
  display: string
  short: string
  /** Local weekday, e.g. "Mon" / "пн". */
  weekdayShort: string
  /** Local day of month, 1–31. */
  dayOfMonth: number
  /** Local calendar date, `YYYY-MM-DD`. */
  date: string
  isToday?: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Local calendar date of `date` as `YYYY-MM-DD`. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Local midnight for a `YYYY-MM-DD` key. (`new Date('2026-11-02')` would be
 * UTC midnight — the previous evening west of UTC.) Full ISO timestamps from
 * older app state are accepted too.
 */
export function parseDateKey(key: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return new Date(key)
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function getTodayDateString() {
  return toDateKey(new Date())
}

export function isTodayDate(date: Date) {
  return toDateKey(date) === toDateKey(new Date())
}

/** Local Monday 00:00 of the week containing `date`. */
export function getStartOfWeek(date: Date) {
  const copy = new Date(date)
  const day = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)

  return copy
}

/** `YYYY-MM-DD` of the Monday of the week containing `date`. */
export function getWeekStartKey(date: Date): string {
  return toDateKey(getStartOfWeek(date))
}

export function buildWeekDays(startDate: Date, locale = 'en-US'): WeekDay[] {
  const days: WeekDay[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push({
      name: date.toLocaleDateString(locale, { weekday: 'long' }),
      display: date.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      }),
      short: date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      }),
      weekdayShort: date
        .toLocaleDateString(locale, { weekday: 'short' })
        .replace('.', ''),
      dayOfMonth: date.getDate(),
      date: toDateKey(date),
      isToday: isTodayDate(date),
    })
  }

  return days
}

/** Normalises a week start (date key or legacy ISO timestamp) to its Monday `YYYY-MM-DD`. */
export function formatWeekStartDate(weekStart: string): string {
  if (!weekStart) return ''
  return getWeekStartKey(parseDateKey(weekStart))
}

/**
 * Server-side guard for `week_start` keys (timezone-free, pure date math).
 *
 * Older app versions derived the key with `toISOString()`, so users east of UTC
 * sent the Sunday *before* their Monday. A Sunday therefore means "the week
 * starting tomorrow"; any other day snaps back to its Monday.
 */
export function normalizeWeekStartKey(key: string): string
export function normalizeWeekStartKey(key: string | null | undefined): string | null
export function normalizeWeekStartKey(key: string | null | undefined): string | null {
  if (!key) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(key)
  if (!match) return key
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  )
  const day = date.getUTCDay()
  date.setUTCDate(date.getUTCDate() + (day === 0 ? 1 : 1 - day))
  return date.toISOString().slice(0, 10)
}

export function formatWeekLabel(startDate: Date, locale = 'en-US') {
  const start = startDate
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const startLabel = start.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  })
  const endLabel = end.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  })

  return `${startLabel} – ${endLabel}`
}
