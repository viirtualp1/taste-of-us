import type { Meta, StoryObj } from '@storybook/vue3'
import TouToast from './TouToast.vue'

const meta: Meta<typeof TouToast> = {
  title: 'UI/TouToast',
  component: TouToast,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Toast renders via a Teleport to <body> and appears fixed in the bottom corner when `message` is set.',
      },
    },
  },
  argTypes: {
    type: { control: 'select', options: ['success', 'error'] },
    message: { control: 'text' },
  },
  args: { message: 'Menu sent successfully!', type: 'success' },
  render: (args) => ({
    components: { TouToast },
    setup: () => ({ args }),
    template: `<TouToast v-bind="args" />`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {}

export const Error: Story = {
  args: { message: 'Something went wrong.', type: 'error' },
}
