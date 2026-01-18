export type MenuCategory = 'brunch' | 'dinner' | 'dessert'

export type CuisineType = 'asian' | 'european' | 'slavic' | 'all'

export interface MenuSelection {
  brunch: string
  dinner: string
  dessert: string
}

export interface MenuData {
  brunch: string[]
  dinner: string[]
  dessert: string[]
}

export interface Dish {
  id: string
  name: string
  category: MenuCategory
  cuisine?: CuisineType
}

export const CATEGORIES: Array<{ key: MenuCategory; label: string }> = [
  { key: 'brunch', label: 'Brunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'dessert', label: 'Dessert' },
]

export const CUISINES: Array<{ key: CuisineType; label: string }> = [
  { key: 'all', label: 'All Cuisines' },
  { key: 'asian', label: 'Asian' },
  { key: 'european', label: 'European' },
  { key: 'slavic', label: 'Slavic' },
]

export function getCategoryIcon(category: MenuCategory): string {
  const icons: Record<MenuCategory, string> = {
    brunch: '🌅',
    dinner: '🌙',
    dessert: '🍰',
  }

  return icons[category]
}

export function getDayCount(
  dayIndex: number,
  selectedMenu: MenuSelection[],
  categories: Array<{ key: MenuCategory; label: string }>,
): number {
  return categories.reduce(
    (acc, category) => (selectedMenu[dayIndex]?.[category.key] ? acc + 1 : acc),
    0,
  )
}

export function getDayLabel(
  dayIndex: number,
  selectedMenu: MenuSelection[],
  categories: Array<{ key: MenuCategory; label: string }>,
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
  categories: Array<{ key: MenuCategory; label: string }>,
): string {
  const count = getDayCount(dayIndex, selectedMenu, categories)

  if (count === 0) {
    return 'bg-white/70 text-gray-600 border border-white/60'
  }

  if (count === categories.length) {
    return 'bg-green-100/80 text-green-700 border border-green-200/80'
  }

  return 'bg-purple-100/80 text-purple-700 border border-purple-200/80'
}

export function getDayLabelColor(
  dayIndex: number,
  selectedMenu: MenuSelection[],
  categories: Array<{ key: MenuCategory; label: string }>,
): string {
  const count = getDayCount(dayIndex, selectedMenu, categories)

  if (count === 0) {
    return 'text-gray-500'
  }

  if (count === categories.length) {
    return 'text-green-600 font-semibold'
  }

  return 'text-purple-600 font-medium'
}

export function calculateStats(
  selectedMenu: MenuSelection[],
  weekDaysLength: number,
  categories: Array<{ key: MenuCategory; label: string }>,
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
  categories: Array<{ key: MenuCategory; label: string }>,
): boolean {
  const day = selectedMenu[dayIndex]
  if (!day) return false

  return categories.every((category) => !!day[category.key])
}

export function findNextIncompleteDay(
  startIndex: number,
  selectedMenu: MenuSelection[],
  weekDaysLength: number,
  categories: Array<{ key: MenuCategory; label: string }>,
): number | null {
  for (let i = startIndex + 1; i < weekDaysLength; i++) {
    if (!isDayComplete(i, selectedMenu, categories)) {
      return i
    }
  }
  return null
}
