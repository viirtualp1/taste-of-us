import type { Meta, StoryObj } from '@storybook/vue3'
import TouBadge from './TouBadge.vue'

const meta: Meta<typeof TouBadge> = {
  title: 'UI/TouBadge',
  component: TouBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'neutral'] },
  },
  args: { variant: 'default' },
  render: (args) => ({
    components: { TouBadge },
    setup: () => ({ args }),
    template: `<TouBadge v-bind="args">12</TouBadge>`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { TouBadge },
    template: `
      <div class="flex items-center gap-3">
        <TouBadge variant="default">Default</TouBadge>
        <TouBadge variant="neutral">Neutral</TouBadge>
      </div>
    `,
  }),
}
