import type { Meta, StoryObj } from '@storybook/vue3'
import TouEmptyState from './TouEmptyState.vue'

const meta: Meta<typeof TouEmptyState> = {
  title: 'UI/TouEmptyState',
  component: TouEmptyState,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    icon: 'heroicons:shopping-cart',
    title: 'Your list is empty',
    description: 'Add items or generate them from your menu.',
  },
  render: (args) => ({
    components: { TouEmptyState },
    setup: () => ({ args }),
    template: `<TouEmptyState v-bind="args" />`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutIcon: Story = {
  args: {
    icon: undefined,
    title: 'No dishes yet',
    description: undefined,
  },
}
