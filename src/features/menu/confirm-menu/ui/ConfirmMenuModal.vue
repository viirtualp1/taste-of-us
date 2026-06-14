<template>
  <BottomSheet
    :is-open="isOpen"
    :title="t('menu.confirmTitle')"
    content-class="p-4 sm:p-6 pb-0"
    @close="handleEdit"
  >
    <div class="grid grid-cols-1 gap-3 sm:gap-4">
      <div
        v-for="(day, index) in weekDays"
        :key="day.date"
        class="glass-nested rounded-[16px] p-3 sm:p-4 border border-gray-200/50"
      >
        <div
          class="mb-3 pb-2 border-b border-white/30"
        >
          <h3 class="text-sm sm:text-base font-bold text-gray-900">
            {{ day.name }}
          </h3>
          <span class="text-xs text-gray-500">{{ day.short }}</span>
        </div>

        <div class="space-y-2">
          <div
            v-if="selectedMenu[index]?.brunch"
            class="flex items-start gap-2 p-2 rounded-[12px] bg-green-50/60 border-l-[3px] border-green-300"
          >
            <span class="text-base flex-shrink-0">🌅</span>
            <div class="flex-1 min-w-0">
              <p
                class="text-xs text-gray-500 uppercase tracking-wide mb-0.5"
              >
                {{ t('menu.categories.brunch') }}
              </p>
              <p class="text-sm font-semibold text-gray-900">
                {{ selectedMenu[index].brunch }}
              </p>
            </div>
          </div>
          <div
            v-else
            class="p-2 rounded-[12px] bg-gray-50/50 border border-gray-200/50"
          >
            <p class="text-xs text-gray-400 italic text-center">
              {{ t('menu.noBrunch') }}
            </p>
          </div>

          <div
            v-if="selectedMenu[index]?.dinner"
            class="flex items-start gap-2 p-2 rounded-[12px] bg-emerald-50/60 border-l-[3px] border-emerald-300"
          >
            <span class="text-base flex-shrink-0">🌙</span>
            <div class="flex-1 min-w-0">
              <p
                class="text-xs text-gray-500 uppercase tracking-wide mb-0.5"
              >
                {{ t('menu.categories.dinner') }}
              </p>
              <p class="text-sm font-semibold text-gray-900">
                {{ selectedMenu[index].dinner }}
              </p>
            </div>
          </div>
          <div
            v-else
            class="p-2 rounded-[12px] bg-gray-50/50 border border-gray-200/50"
          >
            <p class="text-xs text-gray-400 italic text-center">
              {{ t('menu.noDinner') }}
            </p>
          </div>

          <div
            v-if="selectedMenu[index]?.dessert"
            class="flex items-start gap-2 p-2 rounded-[12px] bg-yellow-50/60 border-l-[3px] border-yellow-300"
          >
            <span class="text-base flex-shrink-0">🍰</span>
            <div class="flex-1 min-w-0">
              <p
                class="text-xs text-gray-500 uppercase tracking-wide mb-0.5"
              >
                {{ t('menu.categories.dessert') }}
              </p>
              <p class="text-sm font-semibold text-gray-900">
                {{ selectedMenu[index].dessert }}
              </p>
            </div>
          </div>
          <div
            v-else
            class="p-2 rounded-[12px] bg-gray-50/50 border border-gray-200/50"
          >
            <p class="text-xs text-gray-400 italic text-center">
              {{ t('menu.noDessert') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-3 p-4 sm:p-6 pt-4">
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested border border-gray-200/50 text-gray-700 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all"
          @click="handleEdit"
        >
          {{ t('common.edit') }}
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isSending"
          @click="handleConfirm"
        >
          <span
            v-if="isSending"
            class="flex items-center justify-center gap-2"
          >
            <Icon
              name="heroicons:arrow-path"
              class="w-4 h-4 animate-spin"
            />
            {{ t('common.sending') }}
          </span>
          <span v-else>{{ t('menu.confirmAndSend') }}</span>
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { BottomSheet } from '@/shared/ui'
import type { MenuSelection } from '@/entities/menu'
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

const handleEdit = () => {
  emit('edit')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
