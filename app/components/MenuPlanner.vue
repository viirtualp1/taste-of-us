<template>
  <div class="flex flex-col lg:flex-row lg:items-stretch gap-4 md:gap-6">
    <div class="flex-shrink-0 lg:w-1/3">
      <Card class="overflow-hidden h-full flex flex-col">
        <CardContent class="flex-1 flex flex-col">
          <div class="space-y-2">
            <p class="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500">Overview</p>
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900">Plan the week together</h3>
            <p class="text-xs sm:text-sm text-gray-600">
              Choose what your partner can cook. Skip any meal if you want a lighter day.
            </p>
          </div>
          <div class="mt-4 sm:mt-6 flex items-center justify-around gap-2 sm:gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ filledSlots }}</div>
              <div class="text-xs font-semibold text-gray-500">Selected</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ totalSlots }}</div>
              <div class="text-xs font-semibold text-gray-500">Total slots</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ completion }}%</div>
              <div class="text-xs font-semibold text-gray-500">Completion</div>
            </div>
          </div>
          <div class="mt-4 sm:mt-6">
            <div class="h-2 rounded-full bg-white/40 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 transition-all duration-500"
                :style="{ width: `${completion}%` }"
              />
            </div>
            <div class="mt-2 text-xs text-gray-600 text-center">
              {{ filledSlots }} of {{ totalSlots }} meal slots selected
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="flex-1 flex flex-col gap-4 md:gap-6 h-full">
      <Card class="overflow-hidden flex-shrink-0">
        <CardContent class="space-y-4 md:space-y-5">
          <div class="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-1">
              <p class="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500">Week selector</p>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900">Week of {{ weekLabel }}</h3>
              <p class="text-xs sm:text-sm text-gray-600">Pick a date to jump to that week.</p>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 shrink-0">
              <Button variant="ghost" class="shrink-0" @click="goPrevWeek">
                ← Prev
              </Button>
              <div class="bg-white rounded-lg px-2 sm:px-4 py-2 border border-gray-200 shrink-0">
                <input
                  class="bg-transparent text-xs sm:text-sm font-semibold text-gray-800 outline-none w-[120px] sm:w-auto"
                  type="date"
                  :value="weekStartInput"
                  @change="onWeekInputChange"
                >
              </div>
              <Button variant="ghost" class="shrink-0" @click="goNextWeek">
                Next →
              </Button>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-2 -mx-2 px-2">
            <button
              v-for="(day, dayIndex) in weekDays"
              :key="day.date"
              class="min-w-[120px] sm:min-w-[140px] flex-shrink-0 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-left bg-white border transition-all"
              :class="dayIndex === activeDayIndex ? 'border-pink-400 shadow-md ring-2 ring-pink-200' : 'border-gray-200 hover:border-gray-300'"
              @click="focusDay(dayIndex)"
            >
              <div class="text-xs text-gray-500">{{ day.name }}</div>
              <div class="text-lg font-semibold text-gray-900">{{ day.short }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ getDayLabel(dayIndex) }}</div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Transition
        mode="out-in"
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <Card
          v-if="weekDays.length > 0 && weekDays[activeDayIndex]"
          :key="`day-${weekDays[activeDayIndex]?.date}`"
          class="overflow-visible flex-1 flex flex-col"
        >
          <CardHeader v-if="weekDays[activeDayIndex]">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="space-y-1">
                <CardTitle>{{ weekDays[activeDayIndex]?.display }}</CardTitle>
              </div>
              <div
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="getDayBadgeClass(activeDayIndex)"
              >
                {{ getDayLabel(activeDayIndex) }}
              </div>
            </div>
          </CardHeader>
          <CardContent class="pt-0 flex-1 flex flex-col overflow-visible">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 flex-1 overflow-visible">
              <div v-for="category in categories" :key="category.key" class="space-y-2 sm:space-y-3 relative overflow-visible">
                <Label class="flex items-center gap-2">
                  <span class="text-base sm:text-lg">{{ getCategoryIcon(category.key) }}</span>
                  <span class="text-sm sm:text-base">{{ category.label }}</span>
                  <span class="text-xs text-gray-500 font-normal">(optional)</span>
                </Label>
                <SelectDropdown
                  :model-value="selectedMenu[activeDayIndex]?.[category.key] || ''"
                  :options="[
                    { value: '', label: 'Select a dish' },
                    ...(menuData?.[category.key] || []).map(dish => ({ value: dish, label: dish }))
                  ]"
                  placeholder="Select a dish"
                  @update:model-value="(value: string) => updateMenu(activeDayIndex, category.key, value)"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Transition>

      <div class="glass rounded-xl p-4 relative">
        <div class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button class="w-full sm:w-auto sm:min-w-[160px]" variant="outline" @click="resetMenu">
            Reset
          </Button>
          <Button class="w-full sm:w-auto sm:min-w-[180px]" :disabled="isSending" @click="sendMenu">
        <span v-if="isSending" class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Sending...
        </span>
        <span v-else class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send Menu
        </span>
      </Button>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="message"
        :class="[
          'glass rounded-xl p-4 text-center font-medium shadow-lg',
          messageType === 'success' 
            ? 'text-green-700 bg-green-50/80 border border-green-200/50' 
            : 'text-red-700 bg-red-50/80 border border-red-200/50'
        ]"
      >
        <div class="flex items-center justify-center gap-2">
          <svg v-if="messageType === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {{ message }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import Card from './ui/Card.vue'
import CardContent from './ui/CardContent.vue'
import CardHeader from './ui/CardHeader.vue'
import CardTitle from './ui/CardTitle.vue'
import Button from './ui/Button.vue'
import SelectDropdown from './ui/SelectDropdown.vue'

interface MenuSelection {
  breakfast: string
  lunch: string
  dinner: string
}

type MenuCategory = 'breakfast' | 'lunch' | 'dinner'

interface MenuData {
  breakfast: string[]
  lunch: string[]
  dinner: string[]
}

const { data: menuData } = await useFetch<MenuData>('/api/dishes', {
  default: () => ({
    breakfast: [],
    lunch: [],
    dinner: []
  })
})

const categories: Array<{ key: MenuCategory; label: string }> = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' }
]

const getCategoryIcon = (category: MenuCategory) => {
  const icons = {
    breakfast: '🌅',
    lunch: '🍲',
    dinner: '🌙'
  }
  return icons[category]
}

const getStartOfWeek = (date: Date) => {
  const copy = new Date(date)
  const day = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)
  return copy
}

const buildWeekDays = (startDate: Date) => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push({
      name: date.toLocaleDateString('en-US', { weekday: 'long' }),
      display: date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' }),
      short: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date.toISOString().split('T')[0]
    })
  }
  return days
}

const weekStart = ref<string>('')
const isClient = ref(false)

const weekStartDate = computed(() => {
  if (!weekStart.value) return new Date()
  return new Date(weekStart.value)
})

const weekDays = computed(() => {
  if (!isClient.value || !weekStart.value) {
    return []
  }
  try {
    return buildWeekDays(weekStartDate.value)
  } catch {
    return []
  }
})

const activeDayIndex = ref(0)

onMounted(async () => {
  isClient.value = true
  weekStart.value = getStartOfWeek(new Date()).toISOString()
  await loadSchedule()
})

const weekLabel = computed(() => {
  if (!isClient.value || !weekStart.value) {
    return 'Loading...'
  }
  const start = weekStartDate.value
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${startLabel} – ${endLabel}`
})

const weekStartInput = computed(() => {
  if (!isClient.value || !weekStart.value) {
    return ''
  }
  return weekStart.value.split('T')[0]
})

const focusDay = (index: number) => {
  if (index >= 0 && index < weekDays.value.length) {
    activeDayIndex.value = index
  }
}

const goPrevWeek = () => {
  const date = new Date(weekStartDate.value)
  date.setDate(date.getDate() - 7)
  weekStart.value = getStartOfWeek(date).toISOString()
  activeDayIndex.value = 0
}

const goNextWeek = () => {
  const date = new Date(weekStartDate.value)
  date.setDate(date.getDate() + 7)
  weekStart.value = getStartOfWeek(date).toISOString()
  activeDayIndex.value = 0
}

const onWeekInputChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  if (!value) return
  weekStart.value = getStartOfWeek(new Date(value)).toISOString()
  activeDayIndex.value = 0
}

const selectedMenu = ref<MenuSelection[]>([])

watch(weekDays, (days) => {
  if (days.length > 0 && selectedMenu.value.length !== days.length) {
    selectedMenu.value = days.map(() => ({
      breakfast: '',
      lunch: '',
      dinner: ''
    }))
  }
}, { immediate: true })

interface Schedule {
  id: string
  week_start: string
  menu_data: MenuSelection[]
  created_at: string
  updated_at: string
}

const loadSchedule = async () => {
  if (!weekStart.value || !isClient.value) return
  
  try {
    const weekStartDate = getStartOfWeek(new Date(weekStart.value)).toISOString().split('T')[0]
    const schedule = await $fetch<Schedule[]>('/api/schedules', {
      query: { week_start: weekStartDate }
    })
    
    if (schedule && Array.isArray(schedule) && schedule.length > 0 && schedule[0]?.menu_data) {
      const savedMenu = schedule[0].menu_data
      if (Array.isArray(savedMenu) && savedMenu.length === weekDays.value.length) {
        selectedMenu.value = savedMenu
        return
      }
    }
    
    selectedMenu.value = weekDays.value.map(() => ({
      breakfast: '',
      lunch: '',
      dinner: ''
    }))
  } catch (error) {
    console.error('Error loading schedule:', error)
    selectedMenu.value = weekDays.value.map(() => ({
      breakfast: '',
      lunch: '',
      dinner: ''
    }))
  }
}

const saveSchedule = async () => {
  if (!weekStart.value || !isClient.value || weekDays.value.length === 0) return
  
  try {
    const weekStartDate = getStartOfWeek(new Date(weekStart.value)).toISOString().split('T')[0]
    await $fetch('/api/schedules', {
      method: 'POST',
      body: {
        week_start: weekStartDate,
        menu_data: selectedMenu.value
      }
    })
  } catch (error) {
    console.error('Error saving schedule:', error)
  }
}

watch(weekStart, async () => {
  if (weekDays.value.length > 0) {
    await loadSchedule()
  }
}, { immediate: false })

watch(selectedMenu, () => {
  if (isClient.value && weekDays.value.length > 0) {
    const timeoutId = setTimeout(() => {
      saveSchedule()
    }, 1000)
    return () => clearTimeout(timeoutId)
  }
}, { deep: true })

const totalSlots = computed(() => weekDays.value.length * categories.length)
const filledSlots = computed(() => (
  selectedMenu.value.reduce((acc, day) => (
    acc + categories.reduce((innerAcc, category) => (
      day?.[category.key] ? innerAcc + 1 : innerAcc
    ), 0)
  ), 0)
))

const completion = computed(() => (
  totalSlots.value ? Math.round((filledSlots.value / totalSlots.value) * 100) : 0
))

const getDayCount = (dayIndex: number) => (
  categories.reduce((acc, category) => (
    selectedMenu.value[dayIndex]?.[category.key] ? acc + 1 : acc
  ), 0)
)

const getDayLabel = (dayIndex: number) => {
  const count = getDayCount(dayIndex)
  if (count === 0) return 'Not set'
  if (count === categories.length) return 'Complete'
  return `${count}/${categories.length} selected`
}

const getDayBadgeClass = (dayIndex: number) => {
  const count = getDayCount(dayIndex)
  if (count === 0) return 'bg-white/70 text-gray-600 border border-white/60'
  if (count === categories.length) return 'bg-green-100/80 text-green-700 border border-green-200/80'
  return 'bg-purple-100/80 text-purple-700 border border-purple-200/80'
}

const isSending = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const updateMenu = (dayIndex: number, category: MenuCategory, value: string) => {
  if (!selectedMenu.value[dayIndex]) {
    selectedMenu.value[dayIndex] = { breakfast: '', lunch: '', dinner: '' }
  }
  selectedMenu.value[dayIndex][category] = value
}

const resetMenu = () => {
  selectedMenu.value = weekDays.value.map(() => ({
    breakfast: '',
    lunch: '',
    dinner: ''
  }))
  message.value = ''
}

const sendMenu = async () => {
  isSending.value = true
  message.value = ''

  try {
    await saveSchedule()
    
    const menuPayload = weekDays.value.map((day, index) => ({
      day: day.display,
      date: day.date,
      meals: selectedMenu.value[index] || { breakfast: '', lunch: '', dinner: '' }
    }))

    await $fetch('/api/send-menu', {
      method: 'POST',
      body: { menu: menuPayload }
    })

    message.value = 'Menu sent successfully!'
    messageType.value = 'success'
  } catch (error) {
    console.error('Error sending menu:', error)
    message.value = 'Error sending menu. Please try again.'
    messageType.value = 'error'
  } finally {
    isSending.value = false
  }
}
</script>
