<template>
  <section>
    <div class="flex items-center justify-between gap-3 px-1 pb-3">
      <tou-skeleton class="h-7 w-48" />
      <tou-skeleton class="h-6 w-20 rounded-full!" />
    </div>
    <div class="list">
      <div v-for="i in 3" :key="i" class="list-row">
        <tou-skeleton class="h-[30px] w-[30px] rounded-[8px]!" />
        <div class="flex-1 space-y-1.5">
          <tou-skeleton class="h-3 w-16" />
          <tou-skeleton class="h-4 w-40" />
        </div>
      </div>
    </div>
    <div class="list mt-4">
      <div class="list-row">
        <tou-skeleton class="h-[30px] w-[30px] rounded-[8px]!" />
        <tou-skeleton class="h-4 w-48" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { TouSkeleton } from '@/shared/ui'
</script>
