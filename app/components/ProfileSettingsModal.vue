<template>
  <BottomSheet
    :is-open="isOpen"
    title="Profile Settings"
    content-class="p-4 sm:p-6 space-y-6"
    @close="closeModal"
  >
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-[12px] p-3"
    >
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <div>
      <label
        for="telegram-id"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Telegram Chat ID
      </label>
      <input
        id="telegram-id"
        v-model="telegramId"
        type="text"
        placeholder="Enter your girlfriend's Telegram Chat ID"
        class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-pink-400/60 focus:outline-none focus:ring-2 focus:ring-pink-200/50 transition-all"
        :disabled="isLoading"
      />
      <p class="mt-2 text-xs text-gray-500">
        This ID will be used to send her weekly menu plan.
      </p>
    </div>

    <div class="bg-blue-50/80 border border-blue-200 rounded-[12px] p-4">
      <div class="flex items-start gap-3">
        <Icon
          name="heroicons:information-circle"
          class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
        />
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-blue-900 mb-2">
            How to get your Telegram Chat ID?
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

    <template #footer>
      <div class="flex gap-3 p-4 sm:p-6">
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested text-gray-700 font-medium hover:bg-white/50 transition-colors"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import BottomSheet from '@/components/ui/BottomSheet.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [telegramId: string]
}>()

const { getAuthHeaders, isAuthenticated } = useAuth()
const telegramId = ref('')
const isLoading = ref(false)
const error = ref('')

const loadSettings = async () => {
  if (!isAuthenticated.value) {
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const headers = getAuthHeaders()
    const response = await $fetch<{ telegram_chat_id: string | null }>(
      '/api/user/settings',
      {
        headers,
      },
    )

    telegramId.value = response.telegram_chat_id || ''
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
    const headers = getAuthHeaders()
    await $fetch('/api/user/settings', {
      method: 'POST',
      headers,
      body: {
        telegram_chat_id: telegramId.value || null,
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
