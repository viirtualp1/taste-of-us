<template>
  <BottomSheet
    :is-open="isOpen"
    title="Profile Settings"
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
            How to get your Your Telegram Chat ID?
          </h3>
          <ol
            class="text-xs text-blue-800 space-y-2 list-decimal list-inside"
          >
            <li>
              Open Telegram and search for
              <span class="font-mono font-semibold">@userinfobot</span>
            </li>
            <li>Start a conversation with the bot</li>
            <li>Send any message to the bot</li>
            <li>
              The bot will reply with your Chat ID (a number like
              <span class="font-mono">123456789</span>)
            </li>
            <li>Copy that number and paste it here</li>
          </ol>
        </div>
      </div>
    </div>

    <div>
      <label
        for="telegram-id"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Your Telegram Chat ID
      </label>
      <input
        id="telegram-id"
        v-model="telegramId"
        type="text"
        placeholder="Enter your Telegram Chat ID"
        class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
        :disabled="isLoading"
      />
      <p class="mt-1 text-xs text-gray-500">
        Where you will receive the weekly menu and “you’re responsible” DMs.
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
            Important: Start a conversation with the bot
          </h3>
          <p class="text-xs text-yellow-800">
            Before receiving menu plans, the recipient must start a
            conversation with the bot by sending
            <span class="font-mono font-semibold">/start</span> to the
            bot. Otherwise, the bot cannot send messages to them.
          </p>
        </div>
      </div>
    </div>

    <div>
      <label
        for="second-member-id"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Partner Telegram Chat ID
        <span class="text-gray-400 font-normal">(optional)</span>
      </label>
      <input
        id="second-member-id"
        v-model="secondMemberId"
        type="text"
        placeholder="Partner’s Chat ID for rotation & responsibility"
        class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
        :disabled="isLoading"
      />
    </div>

    <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Cook assignment
    </label>
    <p class="text-xs text-gray-500 mb-3">
      Automatically pre-fill who cooks in the planner. You can still adjust it per
      day and meal.
    </p>
        <div class="space-y-3">
        <div class="space-y-2">
          <span class="text-xs text-gray-500 block">Mode</span>
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
          v-if="!hasSecondMember"
          class="text-[11px] text-yellow-700 mt-1 flex items-start gap-1.5"
        >
          <Icon
            name="heroicons:exclamation-triangle"
            class="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
          />
          Add a Second member Chat ID to enable automatic rotation between two people.
        </p>
      </div>

      <div v-if="cookRotationMode !== 'none' && hasSecondMember" class="space-y-2">
          <span class="text-xs text-gray-500 block">First in rotation</span>
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
              Me
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
              Partner
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
          Cancel
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
          @click="saveSettings"
        >
          {{ isLoading ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useApiFetch } from '@/composables/useApiFetch'
import BottomSheet from '@/components/ui/BottomSheet.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [telegramId: string]
}>()

const { isAuthenticated } = useAuth()
const { apiFetch } = useApiFetch()
const telegramId = ref('')
const secondMemberId = ref('')
const cookRotationMode = ref<'none' | 'by_day' | 'by_week'>('none')
const cookRotationFirst = ref<'me' | 'partner'>('me')
const isLoading = ref(false)
const error = ref('')

interface SettingsResponse {
  telegram_chat_id: string
  second_member_telegram_chat_id?: string
  cook_rotation_mode?: 'none' | 'by_day' | 'by_week'
  cook_rotation_first?: 'me' | 'partner'
}

const hasSecondMember = computed(
  () => !!secondMemberId.value && secondMemberId.value.trim().length > 0,
)

const cookModeOptions = [
  {
    value: 'none' as const,
    label: 'Off',
    description: 'You choose who cooks for each day and meal.',
  },
  {
    value: 'by_day' as const,
    label: 'By day',
    description: 'Alternate Me and Partner every day.',
  },
  {
    value: 'by_week' as const,
    label: 'By week',
    description: 'One person cooks this week, the other next week.',
  },
] satisfies {
  value: 'none' | 'by_day' | 'by_week'
  label: string
  description: string
}[]

const rotationSummary = computed(() => {
  if (cookRotationMode.value === 'none' || !hasSecondMember.value) {
    return 'Rotation is off. You can still assign cooks in each day card.'
  }

  const first =
    cookRotationFirst.value === 'me' ? 'You' : 'Partner'

  if (cookRotationMode.value === 'by_day') {
    return `${first} cook on day 1, then you alternate each day (Me, Partner, Me, Partner, …).`
  }

  return `${first} cook this week, the other person cooks next week, and it keeps alternating.`
})

function selectCookMode(mode: 'none' | 'by_day' | 'by_week') {
  cookRotationMode.value = mode
}

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
      err?.data?.message || err?.message || 'Failed to load settings'
    console.error('Error loading settings:', err)
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  if (!isAuthenticated.value) {
    error.value = 'Please log in to save settings'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await apiFetch('/api/user/settings', {
      method: 'POST',
      body: {
        telegram_chat_id: telegramId.value || null,
        second_member_telegram_chat_id: secondMemberId.value || null,
        cook_rotation_mode: cookRotationMode.value,
        cook_rotation_first: cookRotationFirst.value,
      },
    })
    emit('save', telegramId.value)
    closeModal()
  } catch (err: any) {
    error.value =
      err?.data?.message || err?.message || 'Failed to save settings'
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
  error.value = ''
  emit('close')
}

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue && isAuthenticated.value) {
      loadSettings()
    }
  },
)
</script>
