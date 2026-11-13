<template>
  <section>
    <div class="section-label">
      <tou-skeleton class="h-7 w-48" />
      <tou-skeleton class="h-6 w-20 rounded-full!" />
    </div>
    <div class="list">
      <div v-for="i in 3" :key="i" class="list-row">
        <tou-skeleton class="size-7.5 rounded-sm!" />
        <div class="flex-1 space-y-1.5">
          <tou-skeleton class="h-3 w-16" />
          <tou-skeleton class="h-4 w-40" />
        </div>
      </div>
    </div>
    <div class="list mt-4">
      <div class="list-row">
        <tou-skeleton class="size-7.5 rounded-sm!" />
        <tou-skeleton class="h-4 w-48" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { TouSkeleton } from '@/shared/ui'
</script>
