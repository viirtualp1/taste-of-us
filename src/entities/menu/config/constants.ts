import type { CuisineType, MenuCategory } from '../model/types'

export const CATEGORY_KEYS: MenuCategory[] = ['brunch', 'dinner', 'dessert']

export const CUISINE_KEYS: CuisineType[] = ['all', 'asian', 'european', 'slavic']

export const CATEGORIES: { key: MenuCategory; label: string }[] = [
  { key: 'brunch', label: 'Brunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'dessert', label: 'Dessert' },
]

export const CUISINES: { key: CuisineType; label: string }[] = [
  { key: 'all', label: 'All Cuisines' },
  { key: 'asian', label: 'Asian' },
  { key: 'european', label: 'European' },
  { key: 'slavic', label: 'Slavic' },
]
