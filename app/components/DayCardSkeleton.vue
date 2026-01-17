<template>
  <tou-card class="overflow-visible flex-1 flex flex-col">
    <tou-card-header>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <tou-skeleton class="h-7 w-40" />
        <tou-skeleton class="h-6 w-24 rounded-full" />
      </div>
    </tou-card-header>
    <tou-card-content class="pt-0 flex-1 flex flex-col overflow-visible">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 flex-1 overflow-visible"
      >
        <div v-for="i in 3" :key="i" class="space-y-2 sm:space-y-3">
          <tou-skeleton class="h-5 w-32" />
          <tou-skeleton class="h-10 w-full rounded-lg" />
        </div>
      </div>
    </tou-card-content>
  </tou-card>
</template>

<script setup lang="ts">
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardHeader from '@/components/ui/TouCard/TouCardHeader.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'
import TouSkeleton from '@/components/ui/TouSkeleton.vue'
</script>
