import type { Meta, StoryObj } from '@storybook/vue3'
import TouSpinner from './TouSpinner.vue'

const meta: Meta<typeof TouSpinner> = {
  title: 'UI/TouSpinner',
  component: TouSpinner,
  tags: ['autodocs'],
  render: (args) => ({
    components: { TouSpinner },
    setup: () => ({ args }),
    template: `<div class="text-green-600"><TouSpinner v-bind="args" /></div>`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => ({
    components: { TouSpinner },
    template: `
      <div class="flex items-center gap-4 text-green-600">
        <TouSpinner class="h-4 w-4" />
        <TouSpinner class="h-6 w-6" />
        <TouSpinner class="h-10 w-10" />
      </div>
    `,
  }),
}
