export interface WeekDay {
  name: string
  display: string
  short: string
  date: string
}

export function getStartOfWeek(date: Date): Date {
  const copy = new Date(date)
  const day = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function buildWeekDays(startDate: Date): WeekDay[] {
  const days: WeekDay[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push({
      name: date.toLocaleDateString('en-US', { weekday: 'long' }),
      display: date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      }),
      short: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      date: date.toISOString().split('T')[0],
    })
  }
  return days
}

export function formatWeekLabel(startDate: Date): string {
  const start = startDate
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const startLabel = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const endLabel = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return `${startLabel} – ${endLabel}`
}
