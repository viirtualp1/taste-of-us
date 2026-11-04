<template>
  <div>
    <PageHeader :title="t('nav.menu')">
      <template v-if="isAuthenticated" #actions>
        <button
          v-glass="{ bezel: 12, refraction: 10 }"
          type="button"
          class="icon-btn icon-btn--sm glass glass-press"
          :aria-label="t('nav.settings')"
          @click="handleOpenProfile()"
        >
          <Icon name="heroicons:cog-6-tooth" class="w-5 h-5" />
        </button>
      </template>
    </PageHeader>

    <div v-if="!isAuthenticated" class="flex justify-center pt-6">
      <div class="surface rounded-[22px] p-6 sm:p-8 max-w-md w-full text-center">
        <span
          class="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-[18px] bg-green-500 text-white"
        >
          <Icon name="heroicons:heart-solid" class="w-8 h-8" />
        </span>
        <h2 class="text-[22px] font-bold mb-1.5">
          {{ t('home.welcomeTitle') }}
        </h2>
        <p class="text-muted-foreground text-[15px] text-balance">
          {{ t('home.welcomeDescription') }}
        </p>

        <div
          v-if="isLoading"
          class="flex items-center justify-center gap-2 pt-6 text-muted-foreground"
        >
          <TouSpinner />
          <span>{{ t('home.initializing') }}</span>
        </div>

        <TouAlert v-else-if="authError" class="mt-5 text-left">
          {{ authError }}
        </TouAlert>
      </div>
    </div>

    <menu-planner v-else ref="menuPlannerRef" />
    <profile-settings-modal
      :is-open="isProfileModalOpen"
      :highlight-partner-on-open="highlightPartnerOnOpen"
      @close="closeProfileModal"
      @save="handleSaveProfileSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { vGlass } from '@/shared/lib/liquid-glass'
import { ref } from 'vue'
import { useTelegram, useRequireAuth } from '@/entities/user'
import MenuPlanner from './MenuPlanner.vue'
import { ProfileSettingsModal } from '@/features/profile/settings'
import { PageHeader } from '@/widgets/page-header'
import { TouAlert, TouSpinner } from '@/shared/ui'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const { isAuthenticated, isLoading, hapticFeedback } = useTelegram()
const authError = ref('')
const isProfileModalOpen = ref(false)
const highlightPartnerOnOpen = ref(false)
const menuPlannerRef = ref<{ reloadSchedule?: () => Promise<void> } | null>(null)

useRequireAuth({
  onFailure: (message) => {
    authError.value = message
  },
  onReady: ({ didAuthenticate }) => {
    if (didAuthenticate) {
      hapticFeedback.success()
    }
  },
})

function handleOpenProfile(options?: { highlightPartner?: boolean }) {
  highlightPartnerOnOpen.value = options?.highlightPartner ?? false
  isProfileModalOpen.value = true
  hapticFeedback.light()
}

function closeProfileModal() {
  isProfileModalOpen.value = false
  highlightPartnerOnOpen.value = false
}

async function handleSaveProfileSettings() {
  closeProfileModal()
  hapticFeedback.success()
  await menuPlannerRef.value?.reloadSchedule?.()
}
</script>
