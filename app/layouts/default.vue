<template>
  <div>
    <div
      class="fixed inset-0 gradient-bg-accent -z-10"
      style="
        will-change: auto;
        transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      "
    />
    <div class="relative min-h-screen">
      <main
        class="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-8 2xl:px-12 pt-5 pb-12"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
