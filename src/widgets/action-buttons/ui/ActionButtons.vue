<template>
  <Teleport defer to="#tabbar-accessory">
    <TouButton
      type="button"
      :class="
        design === 'material' ? 'material-fab md-state' : 'send-btn glass'
      "
      :disabled="props.isSending"
      :aria-label="label"
      aria-haspopup="dialog"
      @click="emit('send')"
    >
      <TouSpinner v-if="props.isSending" class="size-5" />
      <TouIcon
        v-else
        name="heroicons:paper-airplane"
        class="size-5"
        aria-hidden="true"
      />
      <span class="send-label">{{ label }}</span>
    </TouButton>
  </Teleport>
</template>

<script setup lang="ts">
import { TouIcon, TouButton, TouSpinner } from '@/shared/ui'
import { useAppearance } from '@/shared/lib/theme'

const props = defineProps<{
  isSending: boolean
}>()

const emit = defineEmits<{
  send: []
}>()

const { t } = useI18n()
const { design } = useAppearance()

const label = computed(() =>
  props.isSending ? t('common.sending') : t('nav.sendMenu'),
)
</script>

<style scoped>
.send-btn {
  width: var(--tabbar);
  height: var(--tabbar);
  padding: 0;
  border-radius: 50%;
  background: var(--glass);
  color: rgb(var(--accent-ink));
}

.send-label {
  display: none;
}

@media (prefers-reduced-transparency: reduce) {
  .send-btn {
    background: rgb(var(--panel));
  }
}

@media (min-width: 900px) {
  .send-btn {
    justify-content: flex-start;
    width: 100%;
    height: 52px;
    padding: 0 16px;
    gap: 10px;
    border-radius: var(--r-lg);
    font-size: 14px;
    font-weight: 500;
  }

  .send-btn .send-label {
    display: inline;
  }
}

.material-fab {
  --symbol-size: 24px;
  justify-content: center;
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 16px;
  color: var(--md-on-primary-container);
  background: var(--md-primary-container);
  box-shadow: var(--md-elevation-3);
  font: var(--md-label-large);
}

@media (min-width: 1200px) {
  .material-fab {
    width: 100%;
    justify-content: flex-start;
    padding-inline: 16px;
  }

  .material-fab .send-label {
    display: inline;
  }
}
</style>
