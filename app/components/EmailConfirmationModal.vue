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
              <h2 class="text-xl font-bold text-gray-900">
                Confirm Your Email
              </h2>
              <button
                class="flex items-center rounded-lg p-2 hover:bg-white/20 transition-colors"
                @click="closeModal"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div class="flex items-center justify-center mb-4">
                <div
                  class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center"
                >
                  <Icon
                    name="heroicons:envelope"
                    class="w-8 h-8 text-blue-600"
                  />
                </div>
              </div>

              <div class="text-center space-y-2">
                <h3 class="text-lg font-semibold text-gray-900">
                  Check your email
                </h3>
                <p class="text-sm text-gray-600">
                  We've sent a confirmation link to
                  <span class="font-semibold text-gray-900">{{ email }}</span>
                </p>
                <p class="text-sm text-gray-600">
                  Please click the link in the email to confirm your account.
                </p>
              </div>

              <div class="bg-blue-50/80 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <Icon
                    name="heroicons:information-circle"
                    class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  />
                  <div class="flex-1">
                    <p class="text-xs text-blue-800">
                      After confirming your email, you'll be automatically
                      logged in and can start planning your weekly menu!
                    </p>
                  </div>
                </div>
              </div>

              <button
                class="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                @click="closeModal"
              >
                Got it
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  email: string
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const closeModal = () => {
  emit('close')
}
</script>
