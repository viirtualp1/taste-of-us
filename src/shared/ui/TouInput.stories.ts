import type { Meta, StoryObj } from '@storybook/vue3'
import TouInput from './TouInput.vue'

const meta: Meta<typeof TouInput> = {
  title: 'UI/TouInput',
  component: TouInput,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['md', 'sm'] },
  },
  args: { size: 'md', placeholder: 'Type something…' },
  render: (args) => ({
    components: { TouInput },
    setup: () => ({ args }),
    template: `<div class="max-w-sm"><TouInput v-bind="args" class="w-full" /></div>`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = { args: { size: 'sm' } }

export const Disabled: Story = {
  render: (args) => ({
    components: { TouInput },
    setup: () => ({ args }),
    template: `<div class="max-w-sm"><TouInput v-bind="args" class="w-full" disabled value="Disabled" /></div>`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { TouInput },
    template: `
      <div class="space-y-3 max-w-sm">
        <TouInput size="md" class="w-full" placeholder="Medium (default)" />
        <TouInput size="sm" class="w-full" placeholder="Small" />
      </div>
    `,
  }),
}
