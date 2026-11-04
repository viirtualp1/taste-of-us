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
      <div class="flex flex-col h-full min-h-0">
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 pt-5 pb-2 shrink-0">
          <button
            type="button"
            class="btn btn--sm bg-transparent! px-1! font-normal text-[17px]"
            @click="close"
          >
            {{ t('common.cancel') }}
          </button>
          <h2 class="text-[17px] font-semibold text-center truncate">
            {{ t('cook.title') }}
          </h2>
          <button
            type="button"
            class="btn btn--sm bg-transparent! px-1! text-[17px] text-green-700"
            @click="handleSubmit"
          >
            {{ t('common.save') }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-4 pt-2 pb-6 space-y-5">
          <div>
            <div class="list">
              <label class="list-row cursor-pointer">
                <span class="flex-1 text-[17px]">
                  {{ t('cook.enableAssignment') }}
                </span>
                <input
                  v-model="cookSectionEnabled"
                  type="checkbox"
                  role="switch"
                  class="ios-switch"
                />
              </label>
            </div>
            <p class="section-footer">{{ t('cook.description') }}</p>
          </div>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0 overflow-hidden"
            enter-to-class="opacity-100 max-h-[80vh]"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 max-h-[80vh]"
            leave-to-class="opacity-0 max-h-0 overflow-hidden"
          >
            <div v-show="cookSectionEnabled" class="space-y-5 overflow-hidden">
              <div
                role="tablist"
                :aria-label="t('cook.assignByDayOrMeal')"
                class="segmented"
              >
                <button
                  type="button"
                  role="tab"
                  :aria-selected="isWholeDay"
                  @click="setWholeDay(true)"
                >
                  {{ t('cook.wholeDay') }}
                </button>
                <button
                  type="button"
                  role="tab"
                  :aria-selected="!isWholeDay"
                  @click="setWholeDay(false)"
                >
                  {{ t('cook.perMeal') }}
                </button>
              </div>

              <div v-if="isWholeDay">
                <p class="section-header">{{ t('cook.whoCooksDay') }}</p>
                <div
                  class="grid grid-cols-3 gap-2"
                  role="group"
                  :aria-label="t('cook.cookForWholeDay')"
                >
                  <CookChip
                    :selected="!(localCookDay ?? '')"
                    :label="t('common.dash')"
                    @select="onCookChange('cook_day', '')"
                  />
                  <CookChip
                    :selected="(localCookDay ?? '') === 'me'"
                    :label="t('common.me')"
                    @select="onCookChange('cook_day', 'me')"
                  />
                  <CookChip
                    :selected="(localCookDay ?? '') === 'partner'"
                    :label="t('common.partner')"
                    @select="onCookChange('cook_day', 'partner')"
                  />
                </div>
              </div>

              <template v-else>
                <p class="section-footer pt-0! -mt-2">{{ t('cook.assignPerMeal') }}</p>
                <div class="space-y-4">
                  <div
                    v-for="m in mealCookFields"
                    :key="m.key"
                    role="group"
                    :aria-label="t('cook.cookForMeal', { meal: m.label })"
                  >
                    <p class="section-header">{{ m.label }}</p>
                    <div class="grid grid-cols-3 gap-2">
                      <CookChip
                        :selected="!(localMealValue(m.key) ?? '')"
                        :label="t('common.dash')"
                        @select="onCookChange(m.key, '')"
                      />
                      <CookChip
                        :selected="(localMealValue(m.key) ?? '') === 'me'"
                        :label="t('common.me')"
                        @select="onCookChange(m.key, 'me')"
                      />
                      <CookChip
                        :selected="(localMealValue(m.key) ?? '') === 'partner'"
                        :label="t('common.partner')"
                        @select="onCookChange(m.key, 'partner')"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </Transition>
        </div>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BottomSheet, CookChip } from '@/shared/ui'
import type { MenuSelection } from '@/entities/menu'

interface Props {
  isOpen: boolean
  selectedMenu: MenuSelection | null
}

const props = defineProps<Props>()

type CookField = 'cook_day' | 'cook_brunch' | 'cook_dinner' | 'cook_dessert'

const { t } = useI18n()

const mealCookFields = computed(() => [
  { key: 'cook_brunch' as CookField, label: t('menu.categories.brunch') },
  { key: 'cook_dinner' as CookField, label: t('menu.categories.dinner') },
  { key: 'cook_dessert' as CookField, label: t('menu.categories.dessert') },
])

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

function normalizeCookValue(
  v: string | undefined | null,
): '' | 'me' | 'partner' {
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

  cookSectionEnabled.value = hasAny

  const hasPerMeal =
    !!localCookBrunch.value ||
    !!localCookDinner.value ||
    !!localCookDessert.value

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

function onCookChange(field: CookField, value: string) {
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
