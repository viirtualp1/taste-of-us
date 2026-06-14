export type {
  MenuCategory,
  CuisineType,
  CookSlot,
  MenuSelection,
  MenuData,
  Ingredient,
  Dish,
} from './model/types'

export {
  CATEGORIES,
  CUISINES,
  CATEGORY_KEYS,
  CUISINE_KEYS,
} from './config/constants'

export {
  getDayCount,
  getDayLabel,
  getDayBadgeClass,
  getDayLabelColor,
  calculateStats,
  isDayComplete,
  findNextIncompleteDay,
  createEmptyMenuSelection,
  createEmptyWeekMenu,
} from './lib/menuHelpers'

export {
  slotForDay,
  hasManualCookAssignment,
  applyRotationPreFill,
  resolveMealCook,
} from './lib/cookRotation'
export type { CookRotationMode, CookRotationFirst } from './lib/cookRotation'

export { useMenuSchedule } from './model/useMenuSchedule'
export { useWeekNavigation } from './model/useWeekNavigation'
export { useUserDishes } from './model/useUserDishes'

export type { WeekDay } from '@/shared/lib/utils/date'
