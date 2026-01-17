<template>
  <div class="space-y-10">
    <!-- <section class="text-center space-y-4">
      <p class="text-white/80 text-sm tracking-[0.2em] uppercase">
        Weekly Menu Planner
      </p>
      <h2 class="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-lg text-balance">
        Plan a thoughtful week of meals in minutes
      </h2>
      <p class="text-white/90 text-lg font-medium text-balance max-w-2xl mx-auto">
        Choose breakfasts, lunches, and dinners your partner can make. Skip any meal if you want a light day.
      </p>
    </section> -->

    <MenuPlanner />
  </div>
</template>

<script setup lang="ts">
import MenuPlanner from '../components/MenuPlanner.vue'

definePageMeta({
  layout: 'default'
})
</script>
