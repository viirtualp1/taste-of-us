<template>
  <nav
    class="material-nav"
    :class="{ 'account-open': props.accountOpen }"
    :aria-label="t('nav.sections')"
  >
    <NuxtLink
      v-for="item in destinations"
      :key="item.to"
      :to="localePath(item.to)"
      class="material-destination md-state"
      exact-active-class="is-current"
    >
      <span class="destination-icon">
        <TouIcon :name="item.icon" class="size-6" />
      </span>
      <span>{{ t(item.label) }}</span>
    </NuxtLink>
    <TouButton
      type="button"
      variant="ghost"
      class="material-destination account-link md-state"
      aria-haspopup="dialog"
      :aria-expanded="props.accountOpen"
      @click="emit('account')"
    >
      <span class="destination-icon">
        <TouIcon name="heroicons:user-circle" class="size-6" />
      </span>
      <span>{{ t('nav.account') }}</span>
    </TouButton>
  </nav>
</template>

<script setup lang="ts">
import { TouButton, TouIcon } from '@/shared/ui'
import { destinations } from './destinations'

const props = defineProps<{
  accountOpen: boolean
}>()

const emit = defineEmits<{
  account: []
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
.material-nav {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  align-items: stretch;
  width: 100%;
  min-height: var(--tabbar);
  padding: 0 8px env(safe-area-inset-bottom, 0px);
}

.material-nav .material-destination {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  min-height: 48px;
  padding: 4px 0;
  border-radius: 16px;
  color: var(--md-on-surface-variant);
  font: var(--md-label-medium);
  text-align: center;
}

.material-nav .account-link {
  height: 100%;
}

.destination-icon {
  --symbol-size: 24px;
  display: grid;
  place-items: center;
  width: 56px;
  height: 32px;
  border-radius: 999px;
  transition:
    background-color 180ms ease,
    color 180ms ease;
}

.material-nav:not(.account-open) .is-current,
.material-nav .account-link[aria-expanded='true'] {
  color: var(--md-on-surface);
}

.material-nav:not(.account-open) .is-current .destination-icon,
.account-link[aria-expanded='true'] .destination-icon {
  --symbol-fill: 1;
  color: var(--md-on-secondary-container);
  background: var(--md-secondary-container);
}

@media (min-width: 600px) {
  .material-nav {
    grid-auto-flow: row;
    grid-auto-rows: minmax(64px, auto);
    gap: 4px;
    padding-bottom: 0;
  }

  .material-nav .material-destination {
    width: 100%;
  }
}

@media (min-width: 1200px) {
  .material-nav {
    grid-auto-rows: minmax(56px, auto);
  }

  .material-nav .material-destination {
    flex-direction: row;
    justify-content: flex-start;
    gap: 12px;
    padding: 0 16px;
    border-radius: 999px;
    font: var(--md-label-large);
  }

  .destination-icon {
    width: 24px;
    height: 24px;
    background: none;
  }

  .material-nav:not(.account-open) .is-current,
  .material-nav .account-link[aria-expanded='true'] {
    color: var(--md-on-secondary-container);
    background: var(--md-secondary-container);
  }

  .material-nav:not(.account-open) .is-current .destination-icon,
  .account-link[aria-expanded='true'] .destination-icon {
    background: none;
  }
}
</style>
