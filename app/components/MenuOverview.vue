<template>
  <tou-card class="overflow-hidden h-full flex flex-col">
    <tou-card-content class="flex-1 flex flex-col">
      <div class="flex items-start justify-between mb-4">
        <div class="space-y-2 flex-1">
          <p
            class="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500"
          >
            Overview
          </p>
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900">
            Plan the week together
          </h3>
          <p class="text-xs sm:text-sm text-gray-600">
            Choose what your partner can cook. Skip any meal if you want a
            lighter day.
          </p>
        </div>
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
    </tou-card-content>
  </tou-card>
</template>

<script setup lang="ts">
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'

interface Props {
  filledSlots: number
  totalSlots: number
  completion: number
}

defineProps<Props>()
</script>
