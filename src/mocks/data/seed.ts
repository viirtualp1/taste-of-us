import type { MenuCategory } from '@/entities/menu'
import type { CommonItem, ShoppingListItem } from '@/entities/shopping-list'
import { getStartOfWeek } from '@/shared/lib/utils/date'
import { MOCK_TELEGRAM_USER } from './constants'

interface DishRecord {
  id: string
  name: string
  category: MenuCategory
  cuisine?: string | null
}

interface IngredientRecord {
  id: string
  dish_id: string
  name: string
  quantity: string | null
}

interface ScheduleRecord {
  id: string
  week_start: string
  menu_data: Array<{
    brunch: string
    dinner: string
    dessert: string
    cook_day?: string
    cook_brunch?: string
    cook_dinner?: string
    cook_dessert?: string
  }>
  created_at: string
  updated_at: string
}

interface UserSettings {
  telegram_chat_id: string
  second_member_telegram_chat_id: string
  cook_rotation_mode: 'none' | 'by_day' | 'by_week'
  cook_rotation_first: 'me' | 'partner'
}

function id(label: string) {
  return `mock-${label}`
}

function currentWeekStart() {
  return getStartOfWeek(new Date()).toISOString().split('T')[0]!
}

function previousWeekStart() {
  const date = getStartOfWeek(new Date())
  date.setDate(date.getDate() - 7)
  return date.toISOString().split('T')[0]!
}

const DISH = {
  omelet: id('dish-omelet'),
  oatmeal: id('dish-oatmeal'),
  pancakes: id('dish-pancakes'),
  avocadoToast: id('dish-avocado-toast'),
  caesarSalad: id('dish-caesar-salad'),
  borscht: id('dish-borscht'),
  salmon: id('dish-salmon'),
  chicken: id('dish-chicken'),
  pasta: id('dish-pasta'),
  pilaf: id('dish-pilaf'),
  steak: id('dish-steak'),
  fishSoup: id('dish-fish-soup'),
  chocolateCake: id('dish-chocolate-cake'),
  cheesecake: id('dish-cheesecake'),
  fruitSalad: id('dish-fruit-salad'),
  tiramisu: id('dish-tiramisu'),
} as const

const weekStart = currentWeekStart()
const lastWeekStart = previousWeekStart()
const seededAt = new Date().toISOString()

export function createSeedData() {
  const dishes: DishRecord[] = [
    { id: DISH.omelet, name: 'Vegetable Omelet', category: 'brunch', cuisine: 'european' },
    { id: DISH.oatmeal, name: 'Oatmeal with Fruits', category: 'brunch', cuisine: 'european' },
    { id: DISH.pancakes, name: 'Pancakes with Berries', category: 'brunch', cuisine: 'european' },
    { id: DISH.avocadoToast, name: 'Avocado Toast', category: 'brunch', cuisine: 'european' },
    { id: DISH.caesarSalad, name: 'Caesar Salad', category: 'brunch', cuisine: 'european' },
    { id: DISH.borscht, name: 'Borscht', category: 'brunch', cuisine: 'slavic' },
    { id: DISH.salmon, name: 'Grilled Salmon', category: 'dinner', cuisine: 'european' },
    { id: DISH.chicken, name: 'Roasted Chicken', category: 'dinner', cuisine: 'european' },
    { id: DISH.pasta, name: 'Carbonara Pasta', category: 'dinner', cuisine: 'european' },
    { id: DISH.pilaf, name: 'Pilaf', category: 'dinner', cuisine: 'asian' },
    { id: DISH.steak, name: 'Steak with Vegetables', category: 'dinner', cuisine: 'european' },
    { id: DISH.fishSoup, name: 'Fish Soup', category: 'dinner', cuisine: 'slavic' },
    { id: DISH.chocolateCake, name: 'Chocolate Cake', category: 'dessert', cuisine: 'european' },
    { id: DISH.cheesecake, name: 'Cheesecake', category: 'dessert', cuisine: 'european' },
    { id: DISH.fruitSalad, name: 'Fruit Salad', category: 'dessert', cuisine: null },
    { id: DISH.tiramisu, name: 'Tiramisu', category: 'dessert', cuisine: 'european' },
  ]

  const ingredients: IngredientRecord[] = [
    { id: id('ing-eggs'), dish_id: DISH.omelet, name: 'Eggs', quantity: '3' },
    { id: id('ing-pepper'), dish_id: DISH.omelet, name: 'Bell pepper', quantity: '1' },
    { id: id('ing-onion'), dish_id: DISH.omelet, name: 'Onion', quantity: '1/2' },
    { id: id('ing-oats'), dish_id: DISH.oatmeal, name: 'Rolled oats', quantity: '80g' },
    { id: id('ing-milk-oat'), dish_id: DISH.oatmeal, name: 'Milk', quantity: '200ml' },
    { id: id('ing-berries'), dish_id: DISH.oatmeal, name: 'Mixed berries', quantity: '100g' },
    { id: id('ing-flour'), dish_id: DISH.pancakes, name: 'Flour', quantity: '200g' },
    { id: id('ing-milk-pancake'), dish_id: DISH.pancakes, name: 'Milk', quantity: '250ml' },
    { id: id('ing-avocado'), dish_id: DISH.avocadoToast, name: 'Avocado', quantity: '2' },
    { id: id('ing-bread'), dish_id: DISH.avocadoToast, name: 'Sourdough bread', quantity: '4 slices' },
    { id: id('ing-romaine'), dish_id: DISH.caesarSalad, name: 'Romaine lettuce', quantity: '1 head' },
    { id: id('ing-parmesan'), dish_id: DISH.caesarSalad, name: 'Parmesan', quantity: '50g' },
    { id: id('ing-beet'), dish_id: DISH.borscht, name: 'Beetroot', quantity: '3' },
    { id: id('ing-cabbage'), dish_id: DISH.borscht, name: 'Cabbage', quantity: '1/4' },
    { id: id('ing-salmon'), dish_id: DISH.salmon, name: 'Salmon fillet', quantity: '400g' },
    { id: id('ing-lemon'), dish_id: DISH.salmon, name: 'Lemon', quantity: '1' },
    { id: id('ing-dill'), dish_id: DISH.salmon, name: 'Fresh dill', quantity: '1 bunch' },
    { id: id('ing-chicken'), dish_id: DISH.chicken, name: 'Whole chicken', quantity: '1.5kg' },
    { id: id('ing-potato'), dish_id: DISH.chicken, name: 'Potatoes', quantity: '6' },
    { id: id('ing-bacon'), dish_id: DISH.pasta, name: 'Bacon', quantity: '150g' },
    { id: id('ing-pasta'), dish_id: DISH.pasta, name: 'Spaghetti', quantity: '300g' },
    { id: id('ing-rice'), dish_id: DISH.pilaf, name: 'Basmati rice', quantity: '300g' },
    { id: id('ing-carrot'), dish_id: DISH.pilaf, name: 'Carrots', quantity: '2' },
    { id: id('ing-steak'), dish_id: DISH.steak, name: 'Ribeye steak', quantity: '500g' },
    { id: id('ing-zucchini'), dish_id: DISH.steak, name: 'Zucchini', quantity: '2' },
    { id: id('ing-cod'), dish_id: DISH.fishSoup, name: 'White fish fillet', quantity: '400g' },
    { id: id('ing-chocolate'), dish_id: DISH.chocolateCake, name: 'Dark chocolate', quantity: '200g' },
    { id: id('ing-cream-cheese'), dish_id: DISH.cheesecake, name: 'Cream cheese', quantity: '500g' },
    { id: id('ing-cream'), dish_id: DISH.tiramisu, name: 'Mascarpone', quantity: '250g' },
    { id: id('ing-coffee'), dish_id: DISH.tiramisu, name: 'Espresso', quantity: '200ml' },
  ]

  const currentWeekMenu: ScheduleRecord['menu_data'] = [
    {
      brunch: 'Vegetable Omelet',
      dinner: 'Grilled Salmon',
      dessert: 'Chocolate Cake',
      cook_brunch: 'me',
      cook_dinner: 'partner',
      cook_dessert: 'me',
    },
    {
      brunch: 'Oatmeal with Fruits',
      dinner: 'Roasted Chicken',
      dessert: '',
      cook_brunch: 'partner',
      cook_dinner: 'me',
    },
    {
      brunch: 'Pancakes with Berries',
      dinner: 'Carbonara Pasta',
      dessert: 'Cheesecake',
      cook_brunch: 'me',
      cook_dinner: 'me',
      cook_dessert: 'partner',
    },
    {
      brunch: 'Avocado Toast',
      dinner: 'Pilaf',
      dessert: 'Fruit Salad',
      cook_brunch: 'partner',
      cook_dinner: 'partner',
      cook_dessert: 'me',
    },
    {
      brunch: 'Caesar Salad',
      dinner: 'Steak with Vegetables',
      dessert: '',
      cook_brunch: 'me',
      cook_dinner: 'partner',
    },
    {
      brunch: 'Borscht',
      dinner: 'Fish Soup',
      dessert: 'Tiramisu',
      cook_brunch: 'partner',
      cook_dinner: 'me',
      cook_dessert: 'partner',
    },
    {
      brunch: '',
      dinner: 'Grilled Salmon',
      dessert: 'Chocolate Cake',
      cook_dinner: 'me',
      cook_dessert: 'partner',
    },
  ]

  const previousWeekMenu: ScheduleRecord['menu_data'] = [
    {
      brunch: 'Oatmeal with Fruits',
      dinner: 'Pilaf',
      dessert: 'Fruit Salad',
    },
    {
      brunch: 'Vegetable Omelet',
      dinner: 'Roasted Chicken',
      dessert: 'Cheesecake',
    },
    {
      brunch: 'Pancakes with Berries',
      dinner: 'Carbonara Pasta',
      dessert: '',
    },
    {
      brunch: 'Caesar Salad',
      dinner: 'Fish Soup',
      dessert: 'Tiramisu',
    },
    {
      brunch: 'Avocado Toast',
      dinner: 'Steak with Vegetables',
      dessert: 'Chocolate Cake',
    },
    {
      brunch: 'Borscht',
      dinner: 'Grilled Salmon',
      dessert: '',
    },
    {
      brunch: 'Oatmeal with Fruits',
      dinner: 'Pilaf',
      dessert: 'Cheesecake',
    },
  ]

  const schedules: ScheduleRecord[] = [
    {
      id: id('schedule-current'),
      week_start: weekStart,
      menu_data: currentWeekMenu,
      created_at: seededAt,
      updated_at: seededAt,
    },
    {
      id: id('schedule-previous'),
      week_start: lastWeekStart,
      menu_data: previousWeekMenu,
      created_at: seededAt,
      updated_at: seededAt,
    },
  ]

  const commonItems: CommonItem[] = [
    { id: id('common-milk'), name: 'Milk', default_quantity: '1L' },
    { id: id('common-bread'), name: 'Bread', default_quantity: '1 loaf' },
    { id: id('common-eggs'), name: 'Eggs', default_quantity: '10' },
    { id: id('common-butter'), name: 'Butter', default_quantity: '200g' },
    { id: id('common-olive-oil'), name: 'Olive oil', default_quantity: '1 bottle' },
    { id: id('common-coffee'), name: 'Coffee beans', default_quantity: '250g' },
    { id: id('common-toilet-paper'), name: 'Toilet paper', default_quantity: '1 pack' },
  ]

  const shoppingList: ShoppingListItem[] = [
    {
      id: id('shop-salmon'),
      name: 'Salmon fillet',
      quantity: '400g',
      is_checked: true,
      source_type: 'dish',
      source_dish_id: DISH.salmon,
      source_dish_name: 'Grilled Salmon',
      week_start: weekStart,
    },
    {
      id: id('shop-eggs'),
      name: 'Eggs',
      quantity: '3',
      is_checked: true,
      source_type: 'dish',
      source_dish_id: DISH.omelet,
      source_dish_name: 'Vegetable Omelet',
      week_start: weekStart,
    },
    {
      id: id('shop-chocolate'),
      name: 'Dark chocolate',
      quantity: '200g',
      is_checked: false,
      source_type: 'dish',
      source_dish_id: DISH.chocolateCake,
      source_dish_name: 'Chocolate Cake',
      week_start: weekStart,
    },
    {
      id: id('shop-milk'),
      name: 'Milk',
      quantity: '1L',
      is_checked: false,
      source_type: 'common',
      source_dish_id: null,
      week_start: weekStart,
    },
    {
      id: id('shop-bread'),
      name: 'Bread',
      quantity: '1 loaf',
      is_checked: false,
      source_type: 'common',
      source_dish_id: null,
      week_start: weekStart,
    },
    {
      id: id('shop-paper-towels'),
      name: 'Paper towels',
      quantity: '2 rolls',
      is_checked: false,
      source_type: 'manual',
      source_dish_id: null,
      week_start: weekStart,
    },
    {
      id: id('shop-wine'),
      name: 'White wine',
      quantity: '1 bottle',
      is_checked: false,
      source_type: 'manual',
      source_dish_id: null,
      week_start: weekStart,
    },
  ]

  const settings: UserSettings = {
    telegram_chat_id: String(MOCK_TELEGRAM_USER.id),
    second_member_telegram_chat_id: '987654321',
    cook_rotation_mode: 'by_day',
    cook_rotation_first: 'me',
  }

  return {
    dishes,
    ingredients,
    schedules,
    shoppingList,
    commonItems,
    settings,
    telegramMessages: [] as Array<{
      chat_id: string
      text: string
      message_id: number
      method: string
    }>,
  }
}
