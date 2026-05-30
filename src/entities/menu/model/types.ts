export type MenuCategory = 'brunch' | 'dinner' | 'dessert'

export type CuisineType = 'asian' | 'european' | 'slavic' | 'all'

export type CookSlot = 'me' | 'partner' | ''

export interface MenuSelection {
  brunch: string
  dinner: string
  dessert: string
  cook_day?: CookSlot
  cook_brunch?: CookSlot
  cook_dinner?: CookSlot
  cook_dessert?: CookSlot
}

export interface MenuData {
  brunch: string[]
  dinner: string[]
  dessert: string[]
}

export interface Ingredient {
  id: string
  name: string
  quantity?: string | null
}

export interface Dish {
  id: string
  name: string
  category: MenuCategory
  cuisine?: CuisineType
  ingredients?: Ingredient[]
}
