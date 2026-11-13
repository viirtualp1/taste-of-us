import { useAppearance } from '@/shared/lib/theme'

export default defineNuxtPlugin(() => {
  const { design, initialize } = useAppearance()
  initialize()

  watch(
    design,
    (value) => {
      document.documentElement.dataset.design = value
    },
    { immediate: true, flush: 'sync' },
  )
})
