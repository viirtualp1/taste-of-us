<template>
  <tou-card class="overflow-hidden h-full flex flex-col">
    <tou-card-content class="flex-1 flex flex-col">
      <div class="space-y-2">
        <tou-skeleton class="h-3 w-24" />
        <tou-skeleton class="h-7 w-48" />
        <tou-skeleton class="h-4 w-64" />
      </div>
      <div class="mt-4 sm:mt-6 flex items-center justify-around gap-2 sm:gap-4">
        <div class="text-center space-y-2">
          <tou-skeleton class="h-8 w-12 mx-auto" />
          <tou-skeleton class="h-3 w-16 mx-auto" />
        </div>
        <div class="text-center space-y-2">
          <tou-skeleton class="h-8 w-12 mx-auto" />
          <tou-skeleton class="h-3 w-20 mx-auto" />
        </div>
        <div class="text-center space-y-2">
          <tou-skeleton class="h-8 w-12 mx-auto" />
          <tou-skeleton class="h-3 w-20 mx-auto" />
        </div>
      </div>
      <div class="mt-4 sm:mt-6">
        <tou-skeleton class="h-2 w-full rounded-full" />
        <tou-skeleton class="h-3 w-40 mx-auto mt-2" />
      </div>
    </tou-card-content>
  </tou-card>
</template>

<script setup lang="ts">
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'
import TouSkeleton from '@/components/ui/TouSkeleton.vue'
</script>
