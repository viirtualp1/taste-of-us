<template>
  <section class="surface rounded-[22px] p-3 sm:p-4">
    <div class="flex items-center justify-between gap-2 pl-2 pb-3">
      <tou-skeleton class="h-5 w-44" />
      <div class="flex gap-2">
        <tou-skeleton class="h-8 w-8 rounded-full!" />
        <tou-skeleton class="h-8 w-8 rounded-full!" />
      </div>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <div v-for="i in 7" :key="i" class="flex flex-col items-center gap-1.5 py-1">
        <tou-skeleton class="h-3 w-6" />
        <tou-skeleton class="h-[38px] w-[38px] rounded-full!" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { TouSkeleton } from '@/shared/ui'
</script>
