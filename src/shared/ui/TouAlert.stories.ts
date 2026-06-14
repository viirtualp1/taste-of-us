import type { Meta, StoryObj } from '@storybook/vue3'
import TouAlert from './TouAlert.vue'

const meta: Meta<typeof TouAlert> = {
  title: 'UI/TouAlert',
  component: TouAlert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'info', 'warning', 'success'],
    },
    icon: { control: 'text' },
    title: { control: 'text' },
  },
  args: {
    variant: 'error',
    title: undefined,
    icon: undefined,
  },
  render: (args) => ({
    components: { TouAlert },
    setup: () => ({ args }),
    template: `<TouAlert v-bind="args">Something went wrong, please try again.</TouAlert>`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Error: Story = {}

export const InfoWithIconAndTitle: Story = {
  args: {
    variant: 'info',
    icon: 'heroicons:information-circle',
    title: 'How to get your Chat ID',
  },
  render: (args) => ({
    components: { TouAlert },
    setup: () => ({ args }),
    template: `
      <TouAlert v-bind="args">
        <ol class="space-y-2 list-decimal list-inside">
          <li>Open the bot</li>
          <li>Send /start</li>
          <li>Copy your ID</li>
        </ol>
      </TouAlert>
    `,
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { TouAlert },
    template: `
      <div class="space-y-3 max-w-md">
        <TouAlert variant="error">Error message</TouAlert>
        <TouAlert variant="info" icon="heroicons:information-circle" title="Info">Informational message</TouAlert>
        <TouAlert variant="warning" icon="heroicons:exclamation-triangle" title="Warning">Warning message</TouAlert>
        <TouAlert variant="success" icon="heroicons:check-circle" title="Success">Success message</TouAlert>
      </div>
    `,
  }),
}
