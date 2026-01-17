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
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="handleEdit"
        @keydown.esc="handleEdit"
      >
        <div class="fixed inset-0 bg-black/50" @click="handleEdit" />
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="relative z-50 glass rounded-[20px] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div
              class="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 flex-shrink-0"
            >
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
                Confirm Menu
              </h2>
              <button
                class="flex items-center rounded-[12px] p-2 hover:bg-white/20 transition-colors"
                @click="handleEdit"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4 sm:p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div
                  v-for="(day, index) in weekDays"
                  :key="day.date"
                  class="glass-nested rounded-[16px] p-3 sm:p-4 border border-white/40"
                >
                  <div
                    class="flex items-center justify-between mb-3 pb-2 border-b border-white/30"
                  >
                    <h3 class="text-sm sm:text-base font-bold text-gray-900">
                      {{ day.name }}
                    </h3>
                    <span class="text-xs text-gray-500">{{ day.short }}</span>
                  </div>

                  <div class="space-y-2">
                    <div
                      v-if="selectedMenu[index]?.brunch"
                      class="flex items-start gap-2 p-2 rounded-[12px] bg-pink-50/60 border-l-[3px] border-pink-300"
                    >
                      <span class="text-base flex-shrink-0">🌅</span>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                          Brunch
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
                        No brunch
                      </p>
                    </div>

                    <div
                      v-if="selectedMenu[index]?.dinner"
                      class="flex items-start gap-2 p-2 rounded-[12px] bg-purple-50/60 border-l-[3px] border-purple-300"
                    >
                      <span class="text-base flex-shrink-0">🌙</span>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                          Dinner
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
                        No dinner
                      </p>
                    </div>

                    <div
                      v-if="selectedMenu[index]?.dessert"
                      class="flex items-start gap-2 p-2 rounded-[12px] bg-yellow-50/60 border-l-[3px] border-yellow-300"
                    >
                      <span class="text-base flex-shrink-0">🍰</span>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                          Dessert
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
                        No dessert
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex items-center gap-3 p-4 sm:p-6 border-t border-white/20 flex-shrink-0"
            >
              <button
                class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested text-gray-700 font-medium hover:bg-white/50 transition-colors"
                @click="handleEdit"
              >
                Edit
              </button>
              <button
                class="flex-1 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSending"
                @click="handleConfirm"
              >
                <span v-if="isSending" class="flex items-center justify-center gap-2">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                  Sending...
                </span>
                <span v-else>Confirm & Send</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { MenuSelection } from '@/utils/menu'
import type { WeekDay } from '@/utils/date'

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

const handleEdit = () => {
  emit('edit')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
