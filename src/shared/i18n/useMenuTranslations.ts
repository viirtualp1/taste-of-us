import { computed } from 'vue'
import type { MenuCategory, CuisineType, MenuSelection } from '@/entities/menu'
import {
  CATEGORY_KEYS,
  CUISINE_KEYS,
  getDayCount,
  getDayBadgeClass,
  getDayLabelColor,
} from '@/entities/menu'

export function useMenuTranslations() {
  const { t } = useI18n()

  const categories = computed(() =>
    CATEGORY_KEYS.map((key) => ({
      key,
      label: t(`menu.categories.${key}`),
    })),
  )

  const cuisines = computed(() =>
    CUISINE_KEYS.map((key) => ({
      key,
      label: t(`menu.cuisines.${key}`),
    })),
  )

  const getCategoryLabel = (key: MenuCategory) => t(`menu.categories.${key}`)

  const getCuisineLabel = (key: CuisineType) => t(`menu.cuisines.${key}`)

  const getDayLabel = (
    dayIndex: number,
    selectedMenu: MenuSelection[],
    categoryList = categories.value,
  ) => {
    const count = getDayCount(dayIndex, selectedMenu, categoryList)

    if (count === 0) {
      return t('menu.dayStatus.notSet')
    }

    if (count === categoryList.length) {
      return t('menu.dayStatus.complete')
    }

    return t('menu.dayStatus.partial', {
      count,
      total: categoryList.length,
    })
  }

  const getCookLabel = (slot: '' | 'me' | 'partner' | 'per_meal' | 'not_set') => {
    switch (slot) {
      case 'me':
        return t('common.me')
      case 'partner':
        return t('common.partner')
      case 'per_meal':
        return t('menu.perMeal')
      default:
        return t('common.notSet')
    }
  }

  return {
    categories,
    cuisines,
    getCategoryLabel,
    getCuisineLabel,
    getDayLabel,
    getDayBadgeClass,
    getDayLabelColor,
    getCookLabel,
  }
}
