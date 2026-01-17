<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="closeModal"
        @keydown.esc="closeModal"
      >
        <div class="fixed inset-0 bg-black/50" @click="closeModal" />
        <Transition
          enter-active-class="transition ease-out duration-300"
          :enter-from-class="
            isMobile ? 'translate-y-full' : 'opacity-0 scale-95'
          "
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          :leave-to-class="isMobile ? 'translate-y-full' : 'opacity-0 scale-95'"
        >
          <div
            v-if="isOpen"
            ref="modalRef"
            class="relative z-50 glass rounded-t-3xl sm:rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col"
            :class="isMobile ? '' : 'h-[85vh]'"
            :style="
              isMobile
                ? {
                    height: `${modalHeight}vh`,
                    minHeight: '50vh',
                    maxHeight: '95vh',
                    transition: isDragging ? 'none' : 'height 0.3s ease-out',
                  }
                : { height: '85vh' }
            "
            @touchstart="handleModalTouchStart"
            @touchmove="handleModalTouchMove"
            @touchend="handleModalTouchEnd"
          >
            <div
              v-if="isMobile"
              class="flex-shrink-0 flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing touch-none"
              @touchstart.stop="handleHandleTouchStart"
              @touchmove.stop="handleHandleTouchMove"
              @touchend.stop="handleHandleTouchEnd"
            >
              <div
                class="w-16 h-1.5 rounded-full transition-colors"
                :class="
                  isDragging
                    ? 'bg-pink-500 w-20'
                    : 'bg-gray-400 hover:bg-gray-500'
                "
              />
            </div>
            <div
              class="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0"
            >
              <h2 class="text-lg sm:text-xl font-bold text-gray-900">
                Select {{ categoryLabel }}
              </h2>
              <button
                class="flex items-center rounded-lg p-2 hover:bg-white/20 transition-colors"
                @click="closeModal"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div class="flex-1 flex overflow-hidden">
              <div
                class="hidden sm:flex flex-col w-48 border-r border-white/20 flex-shrink-0 bg-white/10"
              >
                <div class="p-4 space-y-2 overflow-y-auto">
                  <button
                    v-for="cuisine in CUISINES"
                    :key="cuisine.key"
                    class="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all text-left"
                    :class="
                      selectedCuisine === cuisine.key
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-gray-200'
                    "
                    @click="selectedCuisine = cuisine.key"
                  >
                    {{ cuisine.label }}
                  </button>
                </div>
              </div>
              <div class="flex-1 flex flex-col overflow-hidden">
                <div
                  class="sm:hidden flex items-center gap-2 flex-wrap p-4 border-b border-white/20 overflow-x-auto"
                >
                  <button
                    v-for="cuisine in CUISINES"
                    :key="cuisine.key"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0"
                    :class="
                      selectedCuisine === cuisine.key
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-gray-200'
                    "
                    @click="selectedCuisine = cuisine.key"
                  >
                    {{ cuisine.label }}
                  </button>
                </div>
                <div
                  class="flex-1 overflow-y-auto p-4 sm:p-6"
                  :class="isMobile ? 'max-h-[calc(95vh-200px)]' : ''"
                >
                  <div
                    v-if="filteredDishes.length === 0"
                    class="text-center py-12 text-gray-500"
                  >
                    <p class="text-lg font-medium">No dishes found</p>
                    <p class="text-sm mt-2">
                      Try selecting a different cuisine
                    </p>
                  </div>
                  <div
                    v-else
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    <button
                      v-for="dish in filteredDishes"
                      :key="dish.id || dish.name"
                      class="p-5 rounded-xl text-left transition-all border-2 flex flex-col gap-2 min-h-[100px]"
                      :class="
                        selectedDish === dish.name
                          ? 'border-pink-500 bg-pink-50 shadow-lg scale-105'
                          : 'border-gray-200 bg-white/70 hover:border-pink-300 hover:bg-pink-50/50 hover:shadow-md'
                      "
                      @click="selectDish(dish.name)"
                    >
                      <span class="font-semibold text-gray-900 text-base">{{
                        dish.name
                      }}</span>
                      <span
                        v-if="dish.cuisine"
                        class="text-xs text-gray-500 mt-auto"
                      >
                        {{ getCuisineLabel(dish.cuisine) }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import type { MenuCategory, CuisineType, Dish } from '@/utils/menu'
import { CUISINES } from '@/utils/menu'

interface Props {
  isOpen: boolean
  category: MenuCategory
  dishes: Dish[]
  selectedDishName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  select: [dishName: string]
}>()

const selectedCuisine = ref<CuisineType>('all')
const selectedDish = ref<string | undefined>(props.selectedDishName)
const modalRef = ref<HTMLElement | null>(null)
const isMobile = ref(false)
const modalHeight = ref(85)
const isDragging = ref(false)
const startY = ref(0)
const startHeight = ref(85)

const categoryLabel = computed(() => {
  return props.category === 'brunch' ? 'Brunch' : 'Dinner'
})

const filteredDishes = computed(() => {
  if (selectedCuisine.value === 'all') {
    return props.dishes
  }
  return props.dishes.filter((dish) => dish.cuisine === selectedCuisine.value)
})

const getCuisineLabel = (cuisine: CuisineType) => {
  return CUISINES.find((c) => c.key === cuisine)?.label || cuisine
}

const selectDish = (dishName: string) => {
  selectedDish.value = dishName
  emit('select', dishName)
  emit('close')
}

const closeModal = () => {
  emit('close')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

const handleHandleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value || !e.touches[0]) return
  isDragging.value = true
  startY.value = e.touches[0].clientY
  startHeight.value = modalHeight.value
  e.preventDefault()
  e.stopPropagation()
}

const handleHandleTouchMove = (e: TouchEvent) => {
  if (!isMobile.value || !isDragging.value || !e.touches[0]) return
  const currentY = e.touches[0].clientY
  const deltaY = startY.value - currentY
  const newHeight = Math.min(
    95,
    Math.max(50, startHeight.value + (deltaY / window.innerHeight) * 100),
  )
  modalHeight.value = newHeight
  e.preventDefault()
  e.stopPropagation()
}

const handleHandleTouchEnd = () => {
  if (!isMobile.value) return
  isDragging.value = false
  if (modalHeight.value < 60) {
    closeModal()
  } else if (modalHeight.value > 85) {
    modalHeight.value = 95
  } else {
    modalHeight.value = 85
  }
}

const handleModalTouchStart = (e: TouchEvent) => {
  if (!isMobile.value || !e.touches[0]) return
  const target = e.target as HTMLElement
  if (
    target.closest('.overflow-y-auto') ||
    target.closest('button') ||
    target.closest('input')
  ) {
    return
  }
  isDragging.value = true
  startY.value = e.touches[0].clientY
  startHeight.value = modalHeight.value
  e.preventDefault()
}

const handleModalTouchMove = (e: TouchEvent) => {
  if (!isMobile.value || !isDragging.value || !e.touches[0]) return
  const currentY = e.touches[0].clientY
  const deltaY = startY.value - currentY
  const newHeight = Math.min(
    95,
    Math.max(50, startHeight.value + (deltaY / window.innerHeight) * 100),
  )
  modalHeight.value = newHeight
  e.preventDefault()
}

const handleModalTouchEnd = () => {
  if (!isMobile.value) return
  isDragging.value = false
  if (modalHeight.value < 60) {
    closeModal()
  } else if (modalHeight.value > 85) {
    modalHeight.value = 95
  } else {
    modalHeight.value = 85
  }
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleEscape)
})

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      if (isMobile.value) {
        modalHeight.value = 85
      }
      if (typeof document !== 'undefined') {
        disableBodyScroll(document.body)
      }
    } else {
      if (typeof document !== 'undefined') {
        enableBodyScroll(document.body)
      }
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    enableBodyScroll(document.body)
  }
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', handleEscape)
})

watch(
  () => props.selectedDishName,
  (newValue) => {
    selectedDish.value = newValue
  },
)
</script>
