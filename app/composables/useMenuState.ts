import { ref } from 'vue'
import type { MenuSelection } from '@/utils/menu'
import type { WeekDay } from '@/utils/date'

const weekDays = ref<WeekDay[]>([])
const selectedMenu = ref<MenuSelection[]>([])
const isSending = ref(false)

export function useMenuState() {
  const setWeekDays = (days: WeekDay[]) => {
    weekDays.value = days
  }

  const setSelectedMenu = (menu: MenuSelection[]) => {
    selectedMenu.value = menu
  }

  const setIsSending = (sending: boolean) => {
    isSending.value = sending
  }

  return {
    weekDays,
    selectedMenu,
    isSending,
    setWeekDays,
    setSelectedMenu,
    setIsSending,
  }
}
