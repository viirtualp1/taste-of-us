<template>
  <!-- Docks next to the tab bar: AppTabBar renders #tabbar-accessory. -->
  <Teleport defer to="#tabbar-accessory">
    <button
      v-glass="{ bezel: 16, refraction: 14, magnify: 0.08 }"
      type="button"
      class="send-btn glass glass-press"
      :disabled="isSending"
      :aria-label="isSending ? t('common.sending') : t('nav.sendMenu')"
      :title="t('nav.sendMenu')"
      @click="$emit('send')"
    >
      <TouSpinner v-if="isSending" class="h-5 w-5" />
      <Icon v-else name="heroicons:paper-airplane-solid" class="w-6 h-6 -rotate-45 translate-x-0.5 -translate-y-px" />
    </button>
  </Teleport>
</template>

<script setup lang="ts">
import { vGlass } from '@/shared/lib/liquid-glass'
import { TouSpinner } from '@/shared/ui'

interface Props {
  isSending: boolean
}

defineProps<Props>()

defineEmits<{
  send: []
}>()

const { t } = useI18n()
</script>

<style scoped>
/* Separate circular action beside the tab bar, as in iOS 26: tinted Liquid Glass. */
.send-btn {
  display: grid;
  place-items: center;
  width: var(--tabbar);
  height: var(--tabbar);
  border-radius: 50%;
  background: rgb(var(--accent) / 0.94);
  color: rgb(var(--on-accent));
  box-shadow:
    inset 0 0 10px rgb(255 255 255 / 0.35),
    0 0 0 0.5px rgb(0 0 0 / 0.06),
    0 10px 26px rgb(var(--accent) / 0.4);
}
.send-btn[data-liquid] {
  background: rgb(var(--accent) / 0.88);
}
.send-btn:disabled {
  opacity: 0.7;
}
</style>
