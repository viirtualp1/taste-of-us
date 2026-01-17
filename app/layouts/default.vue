<template>
  <div>
    <div class="fixed inset-0 gradient-bg -z-10" />
    <div class="relative min-h-screen">
      <main
        class="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-8 2xl:px-12 py-12"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
