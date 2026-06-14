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

    <TouAlert variant="info" icon="heroicons:information-circle">
      After confirming your email, you'll be automatically logged in and can
      start planning your weekly menu!
    </TouAlert>

    <template #footer>
      <div class="p-4 sm:p-6">
        <button
          class="w-full px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          @click="closeModal"
        >
          Got it
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { BottomSheet, TouAlert } from '@/shared/ui'

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
