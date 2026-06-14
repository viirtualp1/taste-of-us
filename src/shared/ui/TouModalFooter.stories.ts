import type { Meta, StoryObj } from '@storybook/vue3'
import TouModalFooter from './TouModalFooter.vue'

const meta: Meta<typeof TouModalFooter> = {
  title: 'UI/TouModalFooter',
  component: TouModalFooter,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    confirmDisabled: { control: 'boolean' },
  },
  args: {
    cancelLabel: 'Cancel',
    confirmLabel: 'Save',
    loadingLabel: 'Saving…',
    loading: false,
    confirmDisabled: false,
  },
  render: (args) => ({
    components: { TouModalFooter },
    setup: () => ({ args }),
    template: `
      <div class="max-w-md border border-border rounded-[20px] overflow-hidden">
        <div class="p-6 text-sm text-muted-foreground">Modal body content…</div>
        <div class="border-t border-border">
          <TouModalFooter v-bind="args" />
        </div>
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = { args: { loading: true } }

export const ConfirmDisabled: Story = { args: { confirmDisabled: true } }
