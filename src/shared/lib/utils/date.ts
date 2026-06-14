export interface WeekDay {
  name: string
  display: string
  short: string
  date: string
  isToday?: boolean
}

export function getTodayDateString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function isTodayDate(date: Date) {
  const t = new Date()
  return (
    date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate()
  )
}

export function getStartOfWeek(date: Date) {
  const copy = new Date(date)
  const day = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)

  return copy
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
      date: date.toISOString().split('T')[0] ?? '',
      isToday: isTodayDate(date),
    })
  }

  return days
}

export function formatWeekStartDate(isoWeekStart: string): string {
  if (!isoWeekStart) return ''
  return isoWeekStart.split('T')[0] ?? ''
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
