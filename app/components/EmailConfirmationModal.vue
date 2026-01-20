<template>
  <BottomSheet
    :is-open="isOpen"
    title="Confirm Your Email"
    content-class="p-4 sm:p-6 space-y-4"
    @close="closeModal"
  >
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

    <div
      class="bg-blue-50/80 border border-blue-200 rounded-[16px] p-4"
    >
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

    <template #footer>
      <div class="p-4 sm:p-6">
        <button
          class="w-full px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          @click="closeModal"
        >
          Got it
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import BottomSheet from '@/components/ui/BottomSheet.vue'

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
