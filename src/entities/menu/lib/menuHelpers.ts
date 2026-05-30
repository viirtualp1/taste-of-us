import type { CookSlot, MenuCategory, MenuSelection } from '../model/types'

export function createEmptyMenuSelection(): MenuSelection {
  return {
    brunch: '',
    dinner: '',
    dessert: '',
    cook_day: '' as CookSlot,
    cook_brunch: '' as CookSlot,
    cook_dinner: '' as CookSlot,
    cook_dessert: '' as CookSlot,
  }
}

export function createEmptyWeekMenu(dayCount: number): MenuSelection[] {
  return Array.from({ length: dayCount }, () => createEmptyMenuSelection())
}

export function getDayCount(
  dayIndex: number,
  selectedMenu: MenuSelection[],
  categories: { key: MenuCategory; label: string }[],
): number {
  return categories.reduce(
    (acc, category) => (selectedMenu[dayIndex]?.[category.key] ? acc + 1 : acc),
    0,
  )
}

export function getDayLabel(
  dayIndex: number,
  selectedMenu: MenuSelection[],
  categories: { key: MenuCategory; label: string }[],
): string {
  const count = getDayCount(dayIndex, selectedMenu, categories)

  if (count === 0) {
    return 'Not set'
  }

  if (count === categories.length) {
    return 'Complete'
  }

  return `${count}/${categories.length} selected`
}

export function getDayBadgeClass(
  dayIndex: number,
  selectedMenu: MenuSelection[],
  categories: { key: MenuCategory; label: string }[],
): string {
  const count = getDayCount(dayIndex, selectedMenu, categories)

  if (count === 0) {
    return 'bg-white/70 text-gray-600 border border-gray-200/50'
  }

  if (count === categories.length) {
    return 'bg-green-100/80 text-green-700 border border-green-200/80'
  }

  return 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/80'
}

export function getDayLabelColor(
  dayIndex: number,
  selectedMenu: MenuSelection[],
  categories: { key: MenuCategory; label: string }[],
): string {
  const count = getDayCount(dayIndex, selectedMenu, categories)

  if (count === 0) {
    return 'text-gray-500'
  }

  if (count === categories.length) {
    return 'text-green-600 font-semibold'
  }

  return 'text-emerald-600 font-medium'
}

export function calculateStats(
  selectedMenu: MenuSelection[],
  weekDaysLength: number,
  categories: { key: MenuCategory; label: string }[],
) {
  const totalSlots = weekDaysLength * categories.length
  const filledSlots = selectedMenu.reduce(
    (acc, day) =>
      acc +
      categories.reduce(
        (innerAcc, category) => (day?.[category.key] ? innerAcc + 1 : innerAcc),
        0,
      ),
    0,
  )
  const completion = totalSlots
    ? Math.round((filledSlots / totalSlots) * 100)
    : 0

  return { totalSlots, filledSlots, completion }
}

export function isDayComplete(
  dayIndex: number,
  selectedMenu: MenuSelection[],
  categories: { key: MenuCategory; label: string }[],
): boolean {
  const day = selectedMenu[dayIndex]
  if (!day) return false

  return categories.every((category) => !!day[category.key])
}

export function findNextIncompleteDay(
  startIndex: number,
  selectedMenu: MenuSelection[],
  weekDaysLength: number,
  categories: { key: MenuCategory; label: string }[],
): number | null {
  for (let i = startIndex + 1; i < weekDaysLength; i++) {
    if (!isDayComplete(i, selectedMenu, categories)) {
      return i
    }
  }
  return null
}
