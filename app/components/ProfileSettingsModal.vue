<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="closeModal"
        @keydown.esc="closeModal"
      >
        <div class="fixed inset-0 bg-black/50" @click="closeModal" />
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="relative z-50 glass rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            <div
              class="flex items-center justify-between p-4 border-b border-white/20"
            >
              <h2 class="text-xl font-bold text-gray-900">Profile Settings</h2>
              <button
                class="flex items-center rounded-lg p-2 hover:bg-white/20 transition-colors"
                @click="closeModal"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div class="p-6 space-y-6">
              <div
                v-if="error"
                class="bg-red-50 border border-red-200 rounded-lg p-3"
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
                  class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 bg-white/70 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                  :disabled="isLoading"
                />
                <p class="mt-2 text-xs text-gray-500">
                  This ID will be used to send her weekly menu plan.
                </p>
              </div>

              <div class="bg-blue-50/80 border border-blue-200 rounded-lg p-4">
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
                        <span class="font-mono font-semibold"
                          >@userinfobot</span
                        >
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

              <div
                class="bg-yellow-50/80 border border-yellow-200 rounded-lg p-4"
              >
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

              <div class="flex gap-3">
                <button
                  class="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                  @click="closeModal"
                >
                  Cancel
                </button>
                <button
                  class="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isLoading"
                  @click="saveSettings"
                >
                  {{ isLoading ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';

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
