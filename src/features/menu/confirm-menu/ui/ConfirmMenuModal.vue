<template>
  <BottomSheet
    :is-open="isOpen"
    :title="t('menu.confirmTitle')"
    content-class="px-4 pt-2 pb-2 sm:px-5"
    @close="handleEdit"
  >
    <div class="space-y-5">
      <section v-for="(day, index) in weekDays" :key="day.date">
        <h3 class="section-header flex items-baseline justify-between gap-2">
          <span class="capitalize">{{ day.name }}</span>
          <span class="normal-case">{{ day.short }}</span>
        </h3>
        <div class="list list--icons">
          <div v-for="meal in meals" :key="meal.key" class="list-row py-2.5!">
            <span class="row-icon" :style="{ background: meal.color }">
              <Icon :name="meal.icon" class="w-[18px] h-[18px]" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-[13px] leading-tight text-muted-foreground">
                {{ t(`menu.categories.${meal.key}`) }}
              </span>
              <span
                v-if="selectedMenu[index]?.[meal.key]"
                class="block text-[17px] leading-snug truncate"
              >
                {{ selectedMenu[index][meal.key] }}
              </span>
              <span v-else class="block text-[17px] leading-snug text-gray-400">
                {{ t(meal.emptyKey) }}
              </span>
            </span>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <TouModalFooter
        :cancel-label="t('common.edit')"
        :confirm-label="t('menu.confirmAndSend')"
        :loading-label="t('common.sending')"
        :loading="isSending"
        @cancel="handleEdit"
        @confirm="handleConfirm"
      />
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { BottomSheet, TouModalFooter } from '@/shared/ui'
import type { MenuCategory, MenuSelection } from '@/entities/menu'
import type { WeekDay } from '@/shared/lib/utils/date'

interface Props {
  isOpen: boolean
  weekDays: WeekDay[]
  selectedMenu: MenuSelection[]
  isSending?: boolean
}

withDefaults(defineProps<Props>(), {
  isSending: false,
})

const emit = defineEmits<{
  edit: []
  confirm: []
}>()

const { t } = useI18n()

const meals: {
  key: MenuCategory
  icon: string
  color: string
  emptyKey: string
}[] = [
  { key: 'brunch', icon: 'heroicons:sun-solid', color: '#ffcc00', emptyKey: 'menu.noBrunch' },
  { key: 'dinner', icon: 'heroicons:moon-solid', color: '#5856d6', emptyKey: 'menu.noDinner' },
  { key: 'dessert', icon: 'heroicons:cake-solid', color: '#ff2d55', emptyKey: 'menu.noDessert' },
]

const handleEdit = () => {
  emit('edit')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
