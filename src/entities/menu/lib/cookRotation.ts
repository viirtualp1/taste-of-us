import type { CookSlot, MenuSelection } from '../model/types'

export type CookRotationMode = 'none' | 'by_day' | 'by_week'
export type CookRotationFirst = 'me' | 'partner'

type AssignedCookSlot = Exclude<CookSlot, ''>

export function slotForDay(
  dayIndex: number,
  rotationMode: CookRotationMode,
  rotationFirst: CookRotationFirst,
): AssignedCookSlot {
  if (rotationMode === 'by_day') {
    const firstMe = rotationFirst === 'me'
    const idx = firstMe ? dayIndex % 2 : (dayIndex + 1) % 2
    return idx === 0 ? 'me' : 'partner'
  }

  if (rotationMode === 'by_week') {
    return rotationFirst === 'me' ? 'me' : 'partner'
  }

  return 'me'
}

export function hasManualCookAssignment(day: MenuSelection): boolean {
  return !!(
    day.cook_day ||
    day.cook_brunch ||
    day.cook_dinner ||
    day.cook_dessert
  )
}

export function applyRotationPreFill(
  menu: MenuSelection[],
  rotationMode: CookRotationMode,
  rotationFirst: CookRotationFirst,
  hasSecondMember: boolean,
): MenuSelection[] {
  if (rotationMode === 'none' || !hasSecondMember) {
    return menu
  }

  return menu.map((day, index) => {
    if (hasManualCookAssignment(day)) {
      return day
    }

    return {
      ...day,
      cook_day: slotForDay(index, rotationMode, rotationFirst),
      cook_brunch: '' as CookSlot,
      cook_dinner: '' as CookSlot,
      cook_dessert: '' as CookSlot,
    }
  })
}

interface MenuDayInput {
  cook_day?: AssignedCookSlot
  cook_brunch?: AssignedCookSlot
  cook_dinner?: AssignedCookSlot
  cook_dessert?: AssignedCookSlot
  meals: { brunch: string; dinner: string; dessert: string }
  day: string
}

export function resolveMealCook(
  day: MenuDayInput,
  meal: 'brunch' | 'dinner' | 'dessert',
  dayIndex: number,
  rotationMode: CookRotationMode,
  rotationFirst: CookRotationFirst,
): AssignedCookSlot {
  const perMeal = day[`cook_${meal}`]
  if (perMeal) return perMeal
  if (day.cook_day) return day.cook_day

  const useRotation = rotationMode === 'by_day' || rotationMode === 'by_week'
  if (useRotation) {
    return slotForDay(dayIndex, rotationMode, rotationFirst)
  }

  return 'me'
}
