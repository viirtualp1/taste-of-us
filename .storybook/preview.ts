import { h } from 'vue'
import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { Icon as IconifyIcon, addCollection } from '@iconify/vue'
import heroicons from '@iconify-json/heroicons/icons.json'
import '../src/app/styles/main.css'

// Heroicons are bundled so the <Icon> stub renders offline (no network needed).
addCollection(heroicons)

// The app uses Nuxt's auto-imported <Icon name="..."> component. Outside Nuxt we
// register a lightweight shim backed by @iconify/vue so stories render real icons.
setup((app) => {
  app.component('Icon', {
    name: 'Icon',
    props: { name: { type: String, required: true } },
    setup(props: { name: string }, { attrs }) {
      return () => h(IconifyIcon, { icon: props.name, ...attrs })
    },
  })
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    backgrounds: {
      options: {
        app: { name: 'Grouped', value: '#f2f2f7' },
        white: { name: 'White', value: '#ffffff' },
        dark: { name: 'Dark', value: '#000000' },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'app' },
  },
  decorators: [
    (story, context) => {
      // Flip the app's `.dark` palette together with the Dark background.
      const isDark = context.globals.backgrounds?.value === 'dark'
      document.documentElement.classList.toggle('dark', isDark)
      return { components: { story }, template: '<div class="p-6"><story /></div>' }
    },
  ],
}

export default preview
