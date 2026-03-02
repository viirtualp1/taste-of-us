<template>
  <BottomSheet
    :is-open="isOpen"
    custom-layout
    desktop-max-width="sm:max-w-lg"
    desktop-height="80vh"
    :initial-height-ratio="0.5"
    @close="close"
  >
    <template #custom>
      <div class="flex flex-col h-full bg-white">
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0"
        >
          <div class="flex items-center gap-2">
            <span class="text-xl" aria-hidden="true">👨‍🍳</span>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900">
              Responsible for cooking
            </h2>
          </div>
          <button
            class="w-10 h-10 shrink-0 flex items-center justify-center rounded-[12px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close"
            @click.stop="close"
          >
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-5">
          <div
            class="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-[12px] px-3 py-2"
          >
            Choose who is responsible for cooking this day. You can assign for
            the whole day or separately for each meal.
          </div>

          <div
            class="flex items-center justify-between gap-3 p-2 rounded-[14px] bg-gray-50 border border-gray-200/80 cursor-pointer"
            @click="cookSectionEnabled = !cookSectionEnabled"
          >
            <div class="flex items-center gap-3">
              <span
                class="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-[10px] border-2 transition-colors"
                :class="
                  cookSectionEnabled
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white'
                "
              >
                <input
                  v-model="cookSectionEnabled"
                  type="checkbox"
                  class="absolute inset-0 cursor-pointer opacity-0"
                  @click.stop
                />
                <Icon
                  v-if="cookSectionEnabled"
                  name="heroicons:check"
                  class="h-3 w-3 text-green-600"
                />
              </span>
              <span class="text-sm font-semibold text-gray-800">
                Enable cook assignment
              </span>
            </div>
            <span class="text-xs text-gray-500">
              {{ cookSectionEnabled ? 'On' : 'Off' }}
            </span>
          </div>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0 overflow-hidden"
            enter-to-class="opacity-100 max-h-[80vh]"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 max-h-[80vh]"
            leave-to-class="opacity-0 max-h-0 overflow-hidden"
          >
            <div
              v-show="cookSectionEnabled"
              class="space-y-4 sm:space-y-5 overflow-hidden"
            >
              <div
                role="tablist"
                aria-label="Assign by whole day or per meal"
                class="grid grid-cols-2 gap-2 p-1.5 rounded-[14px] bg-gray-100/80 border border-gray-200/60"
              >
                <button
                  type="button"
                  role="tab"
                  :aria-selected="isWholeDay"
                  class="min-h-[44px] rounded-[10px] text-sm font-medium transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60 focus-visible:ring-offset-1"
                  :class="
                    isWholeDay
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200/80'
                      : 'text-gray-500 hover:text-gray-700 active:bg-gray-200/50'
                  "
                  @click="setWholeDay(true)"
                >
                  Whole day
                </button>
                <button
                  type="button"
                  role="tab"
                  :aria-selected="!isWholeDay"
                  class="min-h-[44px] rounded-[10px] text-sm font-medium transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60 focus-visible:ring-offset-1"
                  :class="
                    !isWholeDay
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200/80'
                      : 'text-gray-500 hover:text-gray-700 active:bg-gray-200/50'
                  "
                  @click="setWholeDay(false)"
                >
                  Per meal
                </button>
              </div>

              <div v-if="isWholeDay" class="space-y-2">
                <p class="text-xs text-gray-500 mb-2">
                  Who cooks this day?
                </p>
                <div
                  class="grid grid-cols-3 gap-2"
                  role="group"
                  aria-label="Cook for whole day"
                >
                  <CookChip
                    :selected="!(localCookDay ?? '')"
                    label="—"
                    @select="onCookChange('cook_day', '')"
                  />
                  <CookChip
                    :selected="(localCookDay ?? '') === 'me'"
                    label="Me"
                    @select="onCookChange('cook_day', 'me')"
                  />
                  <CookChip
                    :selected="(localCookDay ?? '') === 'partner'"
                    label="Partner"
                    @select="onCookChange('cook_day', 'partner')"
                  />
                </div>
              </div>

              <template v-else>
                <p class="text-xs text-gray-500 mb-3">Assign per meal</p>
                <div class="space-y-4">
                  <div
                    v-for="m in mealCookFields"
                    :key="m.key"
                    class="space-y-2"
                    role="group"
                    :aria-label="`Cook for ${m.label}`"
                  >
                    <span
                      class="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                    >
                      <span>{{ mealIcon(m.key) }}</span>
                      {{ m.label }}
                    </span>
                    <div class="grid grid-cols-3 gap-2">
                      <CookChip
                        :selected="!(localMealValue(m.key) ?? '')"
                        label="—"
                        @select="onCookChange(m.key, '')"
                      />
                      <CookChip
                        :selected="(localMealValue(m.key) ?? '') === 'me'"
                        label="Me"
                        @select="onCookChange(m.key, 'me')"
                      />
                      <CookChip
                        :selected="(localMealValue(m.key) ?? '') === 'partner'"
                        label="Partner"
                        @select="onCookChange(m.key, 'partner')"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </Transition>
        </div>

        <div
          class="shrink-0 border-t border-gray-200 px-4 py-3 flex justify-end gap-2 bg-white"
        >
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium rounded-[12px] border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-semibold rounded-[12px] bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            @click="handleSubmit"
          >
            Save
          </button>
        </div>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import CookChip from '@/components/ui/CookChip.vue'
import type { MenuSelection, MenuCategory } from '@/utils/menu'
import { getCategoryIcon } from '@/utils/menu'

interface Props {
  isOpen: boolean
  selectedMenu: MenuSelection | null
}

const props = defineProps<Props>()

type CookField =
  | 'cook_day'
  | 'cook_brunch'
  | 'cook_dinner'
  | 'cook_dessert'

const mealCookFields: { key: CookField; label: string }[] = [
  { key: 'cook_brunch', label: 'Brunch' },
  { key: 'cook_dinner', label: 'Dinner' },
  { key: 'cook_dessert', label: 'Dessert' },
]

const emit = defineEmits<{
  close: []
  'update-cook': [field: CookField, value: '' | 'me' | 'partner']
}>()

const assignByWholeDay = ref(true)
const isWholeDay = computed(() => assignByWholeDay.value)

const cookSectionEnabled = ref(false)

const localCookDay = ref<'' | 'me' | 'partner'>('')
const localCookBrunch = ref<'' | 'me' | 'partner'>('')
const localCookDinner = ref<'' | 'me' | 'partner'>('')
const localCookDessert = ref<'' | 'me' | 'partner'>('')

function normalizeCookValue(v: string | undefined | null): '' | 'me' | 'partner' {
  if (v === 'me' || v === 'partner') return v
  return ''
}

function syncFromMenu() {
  const menu = props.selectedMenu
  localCookDay.value = normalizeCookValue(menu?.cook_day)
  localCookBrunch.value = normalizeCookValue(menu?.cook_brunch)
  localCookDinner.value = normalizeCookValue(menu?.cook_dinner)
  localCookDessert.value = normalizeCookValue(menu?.cook_dessert)

  const hasAny =
    !!localCookDay.value ||
    !!localCookBrunch.value ||
    !!localCookDinner.value ||
    !!localCookDessert.value

  cookSectionEnabled.value = hasAny || true

  const hasPerMeal =
    !!localCookBrunch.value || !!localCookDinner.value || !!localCookDessert.value

  if (localCookDay.value) assignByWholeDay.value = true
  else if (hasPerMeal) assignByWholeDay.value = false
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      syncFromMenu()
    }
  },
  { immediate: false },
)

function localMealValue(key: CookField): '' | 'me' | 'partner' {
  if (key === 'cook_brunch') return localCookBrunch.value
  if (key === 'cook_dinner') return localCookDinner.value
  if (key === 'cook_dessert') return localCookDessert.value
  return ''
}

function setWholeDay(v: boolean) {
  assignByWholeDay.value = v
}

function mealIcon(key: CookField): string {
  const k = key.replace('cook_', '') as MenuCategory
  return getCategoryIcon(k)
}

function onCookChange(
  field: CookField,
  value: string,
) {
  const v = normalizeCookValue(value)
  if (field === 'cook_day') {
    localCookDay.value = v
  } else if (field === 'cook_brunch') {
    localCookBrunch.value = v
  } else if (field === 'cook_dinner') {
    localCookDinner.value = v
  } else if (field === 'cook_dessert') {
    localCookDessert.value = v
  }
}

function handleSubmit() {
  if (!cookSectionEnabled.value) {
    emit('update-cook', 'cook_day', '')
    emit('update-cook', 'cook_brunch', '')
    emit('update-cook', 'cook_dinner', '')
    emit('update-cook', 'cook_dessert', '')
  } else {
    emit('update-cook', 'cook_day', localCookDay.value)
    emit('update-cook', 'cook_brunch', localCookBrunch.value)
    emit('update-cook', 'cook_dinner', localCookDinner.value)
    emit('update-cook', 'cook_dessert', localCookDessert.value)
  }
  close()
}

function close() {
  emit('close')
}
</script>
