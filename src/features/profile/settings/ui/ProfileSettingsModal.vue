<template>
  <BottomSheet
    :is-open="isOpen"
    :title="t('profile.title')"
    content-class="p-4 sm:p-6 space-y-3"
    @close="closeModal"
  >
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-[12px] p-3"
    >
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <div class="bg-blue-50/80 border border-blue-200 rounded-[12px] p-4">
      <div class="flex items-start gap-3">
        <Icon
          name="heroicons:information-circle"
          class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
        />
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-blue-900 mb-2">
            {{ t('profile.howToGetChatId') }}
          </h3>
          <ol
            class="text-xs text-blue-800 space-y-2 list-decimal list-inside"
          >
            <li>
              {{ t('profile.chatIdStep1', { bot: '@userinfobot' }) }}
            </li>
            <li>{{ t('profile.chatIdStep2') }}</li>
            <li>{{ t('profile.chatIdStep3') }}</li>
            <li>
              {{ t('profile.chatIdStep4', { example: '123456789' }) }}
            </li>
            <li>{{ t('profile.chatIdStep5') }}</li>
          </ol>
        </div>
      </div>
    </div>

    <div>
      <label
        for="telegram-id"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        {{ t('profile.yourChatId') }}
      </label>
      <input
        id="telegram-id"
        v-model="telegramId"
        type="text"
        :placeholder="t('profile.yourChatIdPlaceholder')"
        class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
        :disabled="isLoading"
      />
      <p class="mt-1 text-xs text-gray-500">
        {{ t('profile.yourChatIdHint') }}
      </p>
    </div>
    <div class="bg-yellow-50/80 border border-yellow-200 rounded-[12px] p-4">
      <div class="flex items-start gap-3">
        <Icon
          name="heroicons:exclamation-triangle"
          class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
        />
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-yellow-900 mb-2">
            {{ t('profile.startBotTitle') }}
          </h3>
          <p class="text-xs text-yellow-800">
            {{ t('profile.startBotDescription', { command: '/start' }) }}
          </p>
        </div>
      </div>
    </div>

    <div
      ref="partnerFieldRef"
      :class="highlightPartnerField ? 'rounded-[12px] ring-2 ring-yellow-400 ring-offset-2' : ''"
    >
      <label
        for="second-member-id"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        {{ t('profile.partnerChatId') }}
        <span class="text-gray-400 font-normal">({{ t('common.optional') }})</span>
      </label>
      <input
        id="second-member-id"
        v-model="secondMemberId"
        type="text"
        :placeholder="t('profile.partnerChatIdPlaceholder')"
        class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
        :class="
          highlightPartnerField
            ? 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-200/60'
            : ''
        "
        :disabled="isLoading"
      />
      <p
        v-if="highlightPartnerField"
        class="mt-2 text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-[10px] px-3 py-2"
      >
        {{ t('profile.partnerHighlight') }}
      </p>
    </div>

    <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ t('profile.cookAssignment') }}
    </label>
    <p class="text-xs text-gray-500 mb-3">
      {{ t('profile.cookAssignmentHint') }}
    </p>
        <div class="space-y-3">
        <div class="space-y-2">
          <span class="text-xs text-gray-500 block">{{ t('profile.mode') }}</span>
          <div class="grid grid-cols-1 gap-2">
          <button
            v-for="option in cookModeOptions"
            :key="option.value"
            type="button"
            class="text-left px-3 py-2.5 rounded-[12px] border text-xs cursor-pointer sm:text-sm transition-all"
            :class="
              cookRotationMode === option.value
                ? 'border-green-500 bg-green-50 text-gray-900 shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50/40'
            "
            @click="selectCookMode(option.value)"
          >
            <div class="font-semibold mb-0.5">
              {{ option.label }}
            </div>
            <div class="text-[11px] text-gray-500">
              {{ option.description }}
            </div>
          </button>
        </div>
        <p
          v-if="!hasSecondMember && !highlightPartnerField"
          class="text-[11px] text-yellow-700 mt-1 flex items-start gap-1.5"
        >
          <Icon
            name="heroicons:exclamation-triangle"
            class="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
          />
          {{ t('profile.addPartnerForRotation') }}
        </p>
      </div>

      <div v-if="cookRotationMode !== 'none' && hasSecondMember" class="space-y-2">
          <span class="text-xs text-gray-500 block">{{ t('profile.firstInRotation') }}</span>
          <div
            class="inline-flex items-center gap-1 p-1 rounded-full bg-gray-100 border border-gray-200"
          >
            <button
              type="button"
              class="px-3 py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all"
              :class="
                cookRotationFirst === 'me'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              "
              @click="cookRotationFirst = 'me'"
            >
              {{ t('common.me') }}
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all"
              :class="
                cookRotationFirst === 'partner'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              "
              @click="cookRotationFirst = 'partner'"
            >
              {{ t('common.partner') }}
            </button>
          </div>
          <p class="text-[11px] text-gray-500">
            {{ rotationSummary }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3 p-4 sm:p-6">
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested border border-gray-200/50 text-gray-700 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all"
          @click="closeModal"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
          @click="saveSettings"
        >
          {{ isLoading ? t('common.saving') : t('common.save') }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useAuth, useApiFetch } from '@/entities/user'
import { BottomSheet } from '@/shared/ui'

interface Props {
  isOpen: boolean
  highlightPartnerOnOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  highlightPartnerOnOpen: false,
})

const emit = defineEmits<{
  close: []
  save: [telegramId: string]
}>()

const { t } = useI18n()
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

interface SettingsResponse {
  telegram_chat_id: string
  second_member_telegram_chat_id?: string
  cook_rotation_mode?: 'none' | 'by_day' | 'by_week'
  cook_rotation_first?: 'me' | 'partner'
}

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
    partnerFieldRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

watch(hasSecondMember, (hasPartner) => {
  if (!hasPartner || !pendingCookMode.value) return
  cookRotationMode.value = pendingCookMode.value
  pendingCookMode.value = null
  highlightPartnerField.value = false
})

const loadSettings = async () => {
  if (!isAuthenticated.value) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await apiFetch<SettingsResponse>('/api/user/settings')
    telegramId.value = response?.telegram_chat_id ?? ''
    secondMemberId.value = response?.second_member_telegram_chat_id ?? ''
    cookRotationMode.value = response?.cook_rotation_mode ?? 'none'
    cookRotationFirst.value = response?.cook_rotation_first ?? 'me'
  } catch (err: any) {
    error.value =
      err?.data?.message || err?.message || t('profile.loadFailed')
    console.error('Error loading settings:', err)
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
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
  } catch (err: any) {
    error.value =
      err?.data?.message || err?.message || t('profile.saveFailed')
    console.error('Error saving settings:', err)
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  telegramId.value = ''
  secondMemberId.value = ''
  cookRotationMode.value = 'none'
  cookRotationFirst.value = 'me'
  highlightPartnerField.value = false
  pendingCookMode.value = null
  error.value = ''
  emit('close')
}

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue && isAuthenticated.value) {
      loadSettings().then(() => {
        if (props.highlightPartnerOnOpen) {
          focusPartnerField()
        }
      })
    }
  },
)
</script>
