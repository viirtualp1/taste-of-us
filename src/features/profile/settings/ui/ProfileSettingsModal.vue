<template>
  <BottomSheet
    :is-open="isOpen"
    :title="isAuthenticated ? t('profile.title') : t('nav.settings')"
    content-class="px-4 pt-2 pb-2 sm:px-5 space-y-5"
    @close="closeModal"
  >
    <section class="space-y-2" aria-labelledby="appearance-title">
      <h3
        id="appearance-title"
        class="text-ios-caption font-semibold text-muted-foreground"
      >
        {{ t('appearance.title') }}
      </h3>
      <div
        class="segmented appearance-options"
        role="group"
        :aria-label="t('appearance.title')"
      >
        <TouButton
          v-for="option in appearanceOptions"
          :key="option"
          type="button"
          variant="ghost"
          :aria-pressed="preference === option"
          @click="setPreference(option)"
        >
          {{ t(`appearance.${option}`) }}
        </TouButton>
      </div>
    </section>

    <section class="space-y-2" aria-labelledby="language-title">
      <h3
        id="language-title"
        class="text-ios-caption font-semibold text-muted-foreground"
      >
        {{ t('locale.language') }}
      </h3>
      <slot name="language" />
    </section>

    <template v-if="isAuthenticated">
      <TouAlert v-if="error">{{ error }}</TouAlert>

      <TouAlert
        variant="info"
        icon="heroicons:information-circle"
        :title="t('profile.howToGetChatId')"
      >
        <ol class="space-y-2 list-decimal list-inside">
          <li>{{ t('profile.chatIdStep1', { bot: '@userinfobot' }) }}</li>
          <li>{{ t('profile.chatIdStep2') }}</li>
          <li>{{ t('profile.chatIdStep3') }}</li>
          <li>{{ t('profile.chatIdStep4', { example: '123456789' }) }}</li>
          <li>{{ t('profile.chatIdStep5') }}</li>
        </ol>
      </TouAlert>

      <div>
        <TouFieldLabel for="telegram-id">
          {{ t('profile.yourChatId') }}
        </TouFieldLabel>
        <TouInput
          id="telegram-id"
          v-model="telegramId"
          type="text"
          class="w-full"
          :placeholder="t('profile.yourChatIdPlaceholder')"
          :disabled="isLoading"
        />
        <p class="mt-1 text-xs text-gray-500">
          {{ t('profile.yourChatIdHint') }}
        </p>
      </div>
      <TouAlert
        variant="warning"
        icon="heroicons:exclamation-triangle"
        :title="t('profile.startBotTitle')"
      >
        {{ t('profile.startBotDescription', { command: '/start' }) }}
      </TouAlert>

      <div
        ref="partnerFieldRef"
        :class="
          highlightPartnerField
            ? 'rounded-lg ring-2 ring-orange-500 ring-offset-4 ring-offset-transparent'
            : ''
        "
      >
        <TouFieldLabel for="second-member-id">
          {{ t('profile.partnerChatId') }}
          <span class="text-gray-400 font-normal"
            >({{ t('common.optional') }})</span
          >
        </TouFieldLabel>
        <TouInput
          id="second-member-id"
          v-model="secondMemberId"
          type="text"
          :class="
            highlightPartnerField
              ? 'w-full shadow-[0_0_0_2px_rgb(var(--orange-500))]!'
              : 'w-full'
          "
          :placeholder="t('profile.partnerChatIdPlaceholder')"
          :disabled="isLoading"
        />
        <p
          v-if="highlightPartnerField"
          class="mt-2 text-ios-caption text-orange-700 bg-orange-500/10 rounded-md px-3 py-2"
        >
          {{ t('profile.partnerHighlight') }}
        </p>
      </div>

      <div>
        <TouFieldLabel>{{ t('profile.cookAssignment') }}</TouFieldLabel>
        <p class="text-xs text-gray-500 mb-3">
          {{ t('profile.cookAssignmentHint') }}
        </p>
        <div class="space-y-3">
          <div class="space-y-2">
            <span class="text-xs text-gray-500 block">{{
              t('profile.mode')
            }}</span>
            <div class="list">
              <button
                v-for="option in cookModeOptions"
                :key="option.value"
                type="button"
                class="list-row"
                :aria-pressed="cookRotationMode === option.value"
                @click="selectCookMode(option.value)"
              >
                <span class="flex-1 min-w-0">
                  <span class="block text-ios-body leading-snug">{{
                    option.label
                  }}</span>
                  <span class="block text-ios-caption text-muted-foreground">
                    {{ option.description }}
                  </span>
                </span>
                <TouIcon
                  v-if="cookRotationMode === option.value"
                  name="heroicons:check-20-solid"
                  class="w-5 h-5 shrink-0 text-accent-foreground"
                />
              </button>
            </div>
            <p
              v-if="!hasSecondMember && !highlightPartnerField"
              class="text-xs text-yellow-700 mt-1 flex items-start gap-1.5"
            >
              <TouIcon
                name="heroicons:exclamation-triangle"
                class="w-3.5 h-3.5 mt-0.5 shrink-0"
              />
              {{ t('profile.addPartnerForRotation') }}
            </p>
          </div>

          <div
            v-if="cookRotationMode !== 'none' && hasSecondMember"
            class="space-y-2"
          >
            <span class="text-xs text-gray-500 block">{{
              t('profile.firstInRotation')
            }}</span>
            <div class="segmented max-w-xs">
              <button
                type="button"
                :aria-pressed="cookRotationFirst === 'me'"
                @click="cookRotationFirst = 'me'"
              >
                {{ t('common.me') }}
              </button>
              <button
                type="button"
                :aria-pressed="cookRotationFirst === 'partner'"
                @click="cookRotationFirst = 'partner'"
              >
                {{ t('common.partner') }}
              </button>
            </div>
            <p class="text-xs text-gray-500">
              {{ rotationSummary }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <template v-if="isAuthenticated" #footer>
      <TouModalFooter
        :cancel-label="t('common.cancel')"
        :confirm-label="t('common.save')"
        :loading-label="t('common.saving')"
        :loading="isLoading"
        @cancel="closeModal"
        @confirm="saveSettings"
      />
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { useAuth, useApiFetch } from '@/entities/user'
import { useAppearance } from '@/shared/lib/theme'
import { getApiErrorMessage } from '@/shared/lib/utils'
import type { AppearancePreference } from '@/shared/lib/theme'
import {
  TouIcon,
  BottomSheet,
  TouAlert,
  TouButton,
  TouFieldLabel,
  TouInput,
  TouModalFooter,
} from '@/shared/ui'

interface Props {
  isOpen: boolean
  highlightPartnerOnOpen?: boolean
}

interface SettingsResponse {
  telegram_chat_id: string
  second_member_telegram_chat_id?: string
  cook_rotation_mode?: 'none' | 'by_day' | 'by_week'
  cook_rotation_first?: 'me' | 'partner'
}

const props = withDefaults(defineProps<Props>(), {
  highlightPartnerOnOpen: false,
})

const emit = defineEmits<{
  close: []
  save: [telegramId: string]
}>()

const appearanceOptions: AppearancePreference[] = [
  'automatic',
  'glass',
  'material',
]

const { t } = useI18n()
const { preference, setPreference } = useAppearance()
const { isAuthenticated } = useAuth()
const { apiFetch } = useApiFetch()
const telegramId = ref('')
const secondMemberId = ref('')
const cookRotationMode = ref<'none' | 'by_day' | 'by_week'>('none')
const cookRotationFirst = ref<'me' | 'partner'>('me')
const isLoading = ref(false)
const error = ref('')
const highlightPartnerField = ref(false)
const pendingCookMode = ref<'by_day' | 'by_week' | null>(null)
const partnerFieldRef = ref<HTMLElement | null>(null)

const hasSecondMember = computed(
  () => !!secondMemberId.value && secondMemberId.value.trim().length > 0,
)

const cookModeOptions = computed(() => [
  {
    value: 'none' as const,
    label: t('profile.cookModeOff'),
    description: t('profile.cookModeOffDesc'),
  },
  {
    value: 'by_day' as const,
    label: t('profile.cookModeByDay'),
    description: t('profile.cookModeByDayDesc'),
  },
  {
    value: 'by_week' as const,
    label: t('profile.cookModeByWeek'),
    description: t('profile.cookModeByWeekDesc'),
  },
])

const rotationSummary = computed(() => {
  if (cookRotationMode.value === 'none' || !hasSecondMember.value) {
    return t('profile.rotationOff')
  }

  const first =
    cookRotationFirst.value === 'me' ? t('common.you') : t('common.partner')

  if (cookRotationMode.value === 'by_day') {
    return t('profile.rotationByDay', { first })
  }

  return t('profile.rotationByWeek', { first })
})

function focusPartnerField() {
  highlightPartnerField.value = true
  nextTick(() => {
    partnerFieldRef.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    document.getElementById('second-member-id')?.focus()
  })
}

function selectCookMode(mode: 'none' | 'by_day' | 'by_week') {
  if (mode !== 'none' && !hasSecondMember.value) {
    pendingCookMode.value = mode
    focusPartnerField()
    return
  }

  pendingCookMode.value = null
  highlightPartnerField.value = false
  cookRotationMode.value = mode
}

async function loadSettings() {
  if (!isAuthenticated.value) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await apiFetch<SettingsResponse>('/api/user/settings')
    telegramId.value = response?.telegram_chat_id ?? ''
    secondMemberId.value = response?.second_member_telegram_chat_id ?? ''
    cookRotationMode.value = response?.cook_rotation_mode ?? 'none'
    cookRotationFirst.value = response?.cook_rotation_first ?? 'me'
  } catch (err) {
    error.value = getApiErrorMessage(err, t('profile.loadFailed'))
    console.error('Error loading settings:', err)
  } finally {
    isLoading.value = false
  }
}

async function saveSettings() {
  if (!isAuthenticated.value) {
    error.value = t('profile.loginToSave')
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await apiFetch<{
      settings: SettingsResponse
    }>('/api/user/settings', {
      method: 'POST',
      body: {
        telegram_chat_id: telegramId.value || null,
        second_member_telegram_chat_id: secondMemberId.value || null,
        cook_rotation_mode: cookRotationMode.value,
        cook_rotation_first: cookRotationFirst.value,
      },
    })
    cookRotationMode.value = response?.settings?.cook_rotation_mode ?? 'none'
    cookRotationFirst.value = response?.settings?.cook_rotation_first ?? 'me'
    emit('save', telegramId.value)
    closeModal()
  } catch (err) {
    error.value = getApiErrorMessage(err, t('profile.saveFailed'))
    console.error('Error saving settings:', err)
  } finally {
    isLoading.value = false
  }
}

function closeModal() {
  telegramId.value = ''
  secondMemberId.value = ''
  cookRotationMode.value = 'none'
  cookRotationFirst.value = 'me'
  highlightPartnerField.value = false
  pendingCookMode.value = null
  error.value = ''
  emit('close')
}

watch(hasSecondMember, (hasPartner) => {
  if (!hasPartner || !pendingCookMode.value) return
  cookRotationMode.value = pendingCookMode.value
  pendingCookMode.value = null
  highlightPartnerField.value = false
})

watch(
  () => props.isOpen,
  async (open) => {
    if (!open || !isAuthenticated.value) return

    await loadSettings()

    if (props.isOpen && props.highlightPartnerOnOpen) focusPartnerField()
  },
)
</script>

<style scoped>
.appearance-options button {
  min-width: 0;
  height: auto;
  min-height: 36px;
  padding: 4px 6px;
  white-space: normal;
  line-height: 1.2;
}
</style>
