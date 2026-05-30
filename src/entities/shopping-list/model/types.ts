export interface ShoppingListItem {
  id: string
  name: string
  quantity: string | null
  is_checked: boolean
  source_type: 'dish' | 'manual' | 'common'
  source_dish_id: string | null
  source_dish_name?: string | null
  week_start: string | null
}

export interface CommonItem {
  id: string
  name: string
  default_quantity: string | null
}
