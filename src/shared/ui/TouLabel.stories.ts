import type { Meta, StoryObj } from '@storybook/vue3'
import TouLabel from './TouLabel.vue'

const meta: Meta<typeof TouLabel> = {
  title: 'UI/TouLabel',
  component: TouLabel,
  tags: ['autodocs'],
  render: (args) => ({
    components: { TouLabel },
    setup: () => ({ args }),
    template: `<TouLabel v-bind="args">Section label</TouLabel>`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
