<template>
  <div class="shell" :class="{ 'material-shell': design === 'material' }">
    <main id="main" class="page">
      <slot />
    </main>
    <AppTabBar
      :has-action="isAuthenticated && page === 'index'"
      :account-open="isSettingsOpen"
      @account="openSettings"
    />
    <ProfileSettingsModal
      :is-open="isSettingsOpen"
      @close="closeSettings"
      @save="handleSettingsSave"
    >
      <template #language>
        <LanguageSwitcher />
      </template>
    </ProfileSettingsModal>
    <LocalePickerModal :is-open="isPickerOpen" />
  </div>
</template>

<script setup lang="ts">
import { useTelegram } from '@/entities/user'
import {
  LanguageSwitcher,
  LocalePickerModal,
  useLocalePreference,
} from '@/features/i18n/locale-picker'
import {
  ProfileSettingsModal,
  useProfileSettingsRevision,
} from '@/features/profile/settings'
import { useAppearance, useTelegramTheme } from '@/shared/lib/theme'
import { AppTabBar } from '@/widgets/app-tab-bar'

const route = useRoute()
const routeBaseName = useRouteBaseName()
const { isAuthenticated, hapticFeedback } = useTelegram()
const { isPickerOpen, openPickerIfNeeded } = useLocalePreference()
const { init: initTheme, cleanup: cleanupTheme } = useTelegramTheme()
const { design } = useAppearance()
const settingsRevision = useProfileSettingsRevision()

const isSettingsOpen = ref(false)

const page = computed(() => routeBaseName(route))

function openSettings() {
  isSettingsOpen.value = true
  hapticFeedback.light()
}

function closeSettings() {
  isSettingsOpen.value = false
}

function handleSettingsSave() {
  closeSettings()
  settingsRevision.value++
  hapticFeedback.success()
}

onMounted(() => {
  initTheme()
  openPickerIfNeeded()
})

onBeforeUnmount(cleanupTheme)
</script>

<style scoped>
.shell {
  min-height: 100dvh;
  padding-bottom: calc(var(--tabbar) + var(--safe-b) + 36px);
}

.page {
  padding-top: calc(var(--safe-t) + 8px);
}

@media (min-width: 900px) {
  .shell {
    padding-bottom: 48px;
  }

  .page {
    max-width: var(--content-max);
    padding-top: calc(var(--safe-t) + 16px);
    padding-left: calc(var(--sidebar) + 40px);
  }
}

.material-shell {
  padding-bottom: calc(var(--tabbar) + var(--safe-b) + 36px);
}

.material-shell .page {
  padding: calc(var(--safe-t) + 8px) 16px 0;
}

@media (min-width: 600px) {
  .material-shell {
    padding: 0 0 48px;
  }

  .material-shell .page {
    max-width: calc(1120px + var(--md-rail-width));
    padding: calc(var(--safe-t) + 16px) 24px 0 calc(var(--md-rail-width) + 24px);
  }
}

@media (min-width: 1200px) {
  .material-shell .page {
    margin-inline: max(0px, calc((100% - 1120px - var(--md-rail-width)) / 2))
      auto;
  }
}
</style>
