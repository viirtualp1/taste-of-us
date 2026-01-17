<template>
  <tou-card class="overflow-hidden flex-shrink-0">
    <tou-card-content class="space-y-4 md:space-y-5">
      <div
        class="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div class="space-y-2">
          <tou-skeleton class="h-3 w-24" />
          <tou-skeleton class="h-7 w-48" />
          <tou-skeleton class="h-4 w-56" />
        </div>
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <tou-skeleton class="h-9 w-20" />
          <tou-skeleton class="h-9 w-32" />
          <tou-skeleton class="h-9 w-20" />
        </div>
      </div>
      <div
        class="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-2 -mx-2 px-2"
      >
        <tou-skeleton
          v-for="i in 7"
          :key="i"
          class="min-w-[120px] sm:min-w-[140px] h-20 flex-shrink-0 rounded-xl"
        />
      </div>
    </tou-card-content>
  </tou-card>
</template>

<script setup lang="ts">
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'
import TouSkeleton from '@/components/ui/TouSkeleton.vue'
</script>
